import React, { useEffect, useMemo, useCallback, useState } from 'react'
import './Table.scss'
import Team from '../../components/Team/Team'
import _ from "lodash"
import Fixtures from '../../components/Fixtures/Fixtures'
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';

const Table = ({ group, teams, getQualifiers }) => {
  const [fixtureList, setFixtureList] = useState([])
  const [teamsState, setTeamsState] = useState([])

  const fixturesCollectionRef = collection(db, "fixtures")

  const getFixtures = async () => {
    const data = await getDocs(fixturesCollectionRef)
    const fixtureIDs = _.map(data.docs, doc => _.get(doc.data(), "fixtureID"))
    const teamsInFixtures = _.uniq(_.flatMap(data.docs, doc => [_.get(doc.data(), "teamOneID"), _.get(doc.data(), "teamTwoID")]))

    const newTeamIDs = teams.map(t => t.localID)

    let fixtureID = 1
    if (fixtureIDs && fixtureIDs.length) {
      fixtureID = _.max(fixtureIDs) + 1
    }
    const fixtures = data.docs
      .map(doc => ({...doc.data(), id: doc.id}))
      .filter(f => f.group === group)

    if (newTeamIDs && newTeamIDs.length && newTeamIDs.length > 1) {
      if (_.every(newTeamIDs, id => _.includes(teamsInFixtures, id))) {
        const filteredFixtures = _.filter(fixtures, fixture => _.includes(newTeamIDs, fixture.teamOneID) && _.includes(newTeamIDs, fixture.teamTwoID))
        const deleteFixtures = _.filter(fixtures, fixture => !_.includes(newTeamIDs, fixture.teamOneID) || !_.includes(newTeamIDs, fixture.teamTwoID))
        setFixtureList(sortFixtures(filteredFixtures))
        deleteCurrentFixtures(deleteFixtures, [], 1, false)
        return filteredFixtures
      } else {
        // There is a new team, delete all fixtures and create new ones
        deleteCurrentFixtures(fixtures, newTeamIDs, fixtureID)
      }
    }
  }

  const deleteCurrentFixtures = async (fixturesToDelete, newTeamIDs, fixtureID, generateNewFixtures=true) => {
    const batch = writeBatch(db)

    _.forEach(fixturesToDelete, fixture => {
      const fixtureToDelete = doc(db, "fixtures", fixture.id)
      batch.delete(fixtureToDelete)
    })

    batch.commit().then(() => {
      if (generateNewFixtures) {
        generateFixtures(newTeamIDs, fixtureID)
      }
    })
  }

  const sortFixtures = (fixtures) => {
    return fixtures.sort((a, b) => a.fixtureID - b.fixtureID)
  }

  const sortTeams = (teams) => {
    const sortedTeams = teams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || a.localID - b.localID);
    if (sortedTeams && sortedTeams.length && sortedTeams.length > 1) {
      getQualifiers(group, sortedTeams[0], sortedTeams[1])
    }
    return sortedTeams
  }

  useEffect(() => {
    setTeamsState(sortTeams(teams))
  }, [teams])

  useEffect(() => {
      getFixtures()
  }, [teams])

  const submitFixture = async (fixtures) => {
    const promises = _.map(fixtures, async (fixture) => {
      try {
        const docRef = await addDoc(fixturesCollectionRef, fixture)
        return {...fixture, id: docRef.id}
      } catch (error) {
        console.log(error)
        return fixture
      }
    })

    const submittedFixtures = await Promise.all(promises)

    setFixtureList(submittedFixtures)
  }

  const findNextFixture = (fixtures, teamObj, _fixtureList=[], ignoreTeams=[], fixtureID) => {
    if (fixtures.length === 0) {
      submitFixture(_fixtureList)
      return
    }

    const _teamObj = {...teamObj}

    _.forEach(ignoreTeams, team => delete _teamObj[team[0]])

    let entries = Object.entries(_teamObj)
    const lowest = _.minBy(entries, pair => pair[1])
    const secondLowest = _.minBy(_.filter(entries, e => lowest.includes(e[0]) && lowest.includes(e[1]) ? false : true), pair => pair[1])

    const nextFixture = _.find(fixtures, fixture => fixture.includes(parseInt(lowest[0])) && fixture.includes(parseInt(secondLowest[0])))

    if (nextFixture) {
      let fixture = {teamOneID: nextFixture[0], teamOneScore: 0, teamTwoID: nextFixture[1], teamTwoScore: 0, group: group, fixtureID: fixtureID}
      _fixtureList = [..._fixtureList, fixture]
      const _fixtures = _.filter(fixtures, fixture => fixture.includes(nextFixture[0]) && fixture.includes(nextFixture[1]) ? false : true)
      const _teamObj = {...teamObj}
      _teamObj[nextFixture[0]] += 1
      _teamObj[nextFixture[1]] += 1
      findNextFixture(_fixtures, _teamObj, _fixtureList, [], fixtureID+1)
    } else {
      findNextFixture(fixtures, teamObj, _fixtureList, [...ignoreTeams, secondLowest], fixtureID)
    }
  }

  const generateFixtures = useCallback((newTeamIDs, fixtureID) => {
    const teamObj = {}
    const fixtures = []

    for (let i=0; i < newTeamIDs.length; i++) {
      if (!_.has(teamObj, newTeamIDs[i])) {
        teamObj[newTeamIDs[i]] = 0
      }
      for (let j=0; j < newTeamIDs.length; j++) {
        if (newTeamIDs[i] === newTeamIDs[j]) {
          continue
        }
        if (_.findIndex(fixtures, fixture => 
          (fixture[0] === newTeamIDs[i] && fixture[1] === newTeamIDs[j]) || 
          (fixture[1] === newTeamIDs[i] && fixture[0] === newTeamIDs[j])
        ) < 0) {
          fixtures.push([newTeamIDs[i], newTeamIDs[j]])
        }
      }
    }

    findNextFixture(fixtures, teamObj, [], [], fixtureID)
  }, [])

  const renderTeams = useMemo(() => {
    return teamsState.map(team => {
      return <Team key={team.localID} team={team} />
    })
  }, [teamsState])

  const updateTable = useCallback((fixtures) => {
    let teamsCopy = _.map(teams, team => {
      return {...team, goalDifference: 0, lost: 0, won: 0, played: 0, points: 0}
    })

    const teamIDs = _.map(teams, team => team.localID)

    if (fixtures && fixtures.length) {
      _.forEach(fixtures, fixture => {
        if (!_.includes(teamIDs, fixture.teamOneID) || !_.includes(teamIDs, fixture.teamTwoID)) {
          return
        }

        if (((fixture.teamOneScore || fixture.teamOneScore === 0) && (fixture.teamTwoScore || fixture.teamTwoScore === 0)) && (fixture.teamOneScore !== fixture.teamTwoScore)) {
          const pointsDifference = Math.abs(fixture.teamOneScore - fixture.teamTwoScore)
          let winner = _.find(teamsCopy, {localID: fixture.teamOneScore > fixture.teamTwoScore ? fixture.teamOneID : fixture.teamTwoID})
          let loser = _.find(teamsCopy, {localID: fixture.teamOneScore < fixture.teamTwoScore ? fixture.teamOneID : fixture.teamTwoID})
          winner = {...winner, points: winner.points + 1, goalDifference: winner.goalDifference + pointsDifference, played: winner.played + 1, won: winner.won + 1}
          loser = {...loser, goalDifference: loser.goalDifference - pointsDifference, played: loser.played + 1, lost: loser.lost + 1}
          teamsCopy = _.filter(teamsCopy, team => team.localID !== winner.localID && team.localID !== loser.localID)
          teamsCopy = [...teamsCopy, winner, loser]
        }
      })
    }
    setTeamsState(sortTeams(teamsCopy))
  }, [teams])

  const recordScores = async (fixture) => {
    try {
      const fixtureDoc = doc(db, "fixtures", fixture.id)
      await updateDoc(fixtureDoc, fixture)
      const fixtures = await getFixtures()
      updateTable(fixtures)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (fixtureList && fixtureList.length && teams && teams.length) {
      updateTable(fixtureList)
    }
  }, [fixtureList, teams])

  const renderFixtures = useMemo(() => {
    return _.map(fixtureList.sort((a, b) => a.fixtureID - b.fixtureID), (fixture) => {
      const teamOne = _.find(teamsState, {localID: fixture.teamOneID})
      const teamTwo = _.find(teamsState, {localID: fixture.teamTwoID})

      return <Fixtures key={fixture.id} fixture={fixture} recordScores={recordScores} teamOne={teamOne} teamTwo={teamTwo} />
    })
  }, [fixtureList, teamsState])

  return (
    <div className='TableContainer'>
      <h1>Group {group}</h1>
      <div className='Table'>
        <div className="TableHead">
          <div className='Large'>Team</div>
          <div className='Mid'>Played</div>
          <div className='Mid'>Cups +/-</div>
          <div className='Mid'>Points</div>
        </div>
        {renderTeams}
      </div>
      <div className="Fixtures">
        {renderFixtures}
      </div>
    </div>
  )
}

export default Table
