import React, { useState, useEffect, useMemo } from 'react'
import { Input } from 'antd';
import { FaAngleRight, FaAngleLeft, FaArrowRight } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import './Groups.scss'
import Table from '../../containers/Table/Table';
import _ from "lodash"
import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import Knockout from '../Knockout/Knockout';
import { TiTick } from "react-icons/ti";
import { MdCancel } from "react-icons/md";

const Groups = () => {
    const teamsCollectionRef = collection(db, "teams")

    const [teamName, setTeamName] = useState("")
    const [groups, setGroups] = useState({})
    const [groupNum] = useState(4)
    const [qualifierNum] = useState(8)
    const [displayCover, setDisplayCover] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [localID, setLocalID] = useState(1)
    const [displayKnockouts, setDisplayKnockouts] = useState(false)
    const [qualifiersOne, setQualifiersOne] = useState([])
    const [qualifiersTwo, setQualifiersTwo] = useState([])
    const [qualifiersThree, setQualifiersThree] = useState([])
    const [qualifiersFour, setQualifiersFour] = useState([])
    const [deleteVisible, setDeleteVisible] = useState(0)

    const getTeams = async (_groups) => {
        const data = await getDocs(teamsCollectionRef)
        const ids = data.docs.map(doc => _.get(doc.data(), "localID"))

        if (ids && ids.length) {
            setLocalID(_.max(ids) + 1)
        }

        data.docs.map(doc => {
            const group = _.get(doc.data(), "group")
            if (_.has(_groups, group)) {
                _groups[group].push({...doc.data(), id: doc.id})
            }
        })

        setGroups(_groups)
    }

    useEffect(() => {
        getTeams()
    }, [])

    useEffect(() => {
        if (!groupNum || !qualifierNum) {
            setDisplayCover(true)
        }
    }, [groupNum, qualifierNum])

    useEffect(() => {
        if (displayCover) {
            setDrawerOpen(false)
        }
    }, [displayCover])

    useEffect(() => {
        if (groupNum > 0) {
            const _groups = {}
    
            for (let i = 0; i < groupNum; i++) {
                _groups[i+1] = [];
            }

            getTeams(_groups)
        }
    }, [groupNum])

    const submitTeam = async (team) => {
        const docRef = await addDoc(teamsCollectionRef, team)
        return {...team, id: docRef.id}
    }

    const enterTeam = async () => {
        if (!teamName) {
            return
        }

        let team = {
            name: teamName,
            played: 0,
            won: 0,
            lost: 0,
            goalDifference: 0,
            points: 0,
            qualified: false,
            localID: localID
        }

        setLocalID(localID + 1)
        let smallestKey;
        let smallestLength = Infinity;

        const _groups = _.cloneDeep(groups)

        if (!_.isEmpty(_groups)) {
            Object.keys(_groups).forEach(group => {
                const currentLength = _groups[group].length
                if (currentLength < smallestLength) {
                    smallestLength = currentLength
                    smallestKey = group
                }
            })

            team.group = smallestKey
            team = await submitTeam(team)
            _groups[smallestKey].push(team)
        }

        setGroups(_groups)
        setTeamName("")
    }

    const getQualifiers = (group, teamOne, teamTwo) => {
        if (group === 1) {
            setQualifiersOne([teamOne, teamTwo])
        } else if (group === 2) {
            setQualifiersTwo([teamOne, teamTwo])
        } else if (group === 3) {
            setQualifiersThree([teamOne, teamTwo])
        } else if (group === 4) {
            setQualifiersFour([teamOne, teamTwo])
        }
    }

    const renderGroups = useMemo(() => {
        return Object.keys(groups).map(group => {
            return (
                <div className="Group" key={group}>
                    <Table key={group} group={parseInt(group)} teams={_.get(groups, group, [])} getQualifiers={getQualifiers}  />
                </div>
            )
        })
    }, [groups])

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            enterTeam()
        }
    }

    const deleteTeam = async (team) => {
        const teamToDelete = doc(db, "teams", team.id)

        try {
            await deleteDoc(teamToDelete)
            // remove from group and delete corresponding fixtures
            const _groups = {}
            _.forEach(Object.keys(groups), group => {
                const teams = groups[group]
                _groups[group] = _.filter(teams, t => t.id !== team.id)
            })
            setGroups(_groups)
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='Groups'>
        <main className='Main'>
            <div className={drawerOpen ? "Drawer Open" : "Drawer"}>
                <div className="DrawerControlContainer">
                    <div className={"DrawerControl"} onClick={() => setDrawerOpen(!drawerOpen)}>{drawerOpen ? <FaAngleLeft /> : <FaAngleRight />}</div>
                </div>

                {drawerOpen && <>
                    <div className='EnterTeams'>
                        <Input placeholder="Enter team name" onChange={(e) => setTeamName(e.target.value)} value={teamName} onKeyDown={handleKeyDown} />
                        <button className='Enter' onClick={enterTeam} disabled={!teamName}>Enter</button>
                    </div>

                    <div className='TeamList'>
                        {_.map(Object.values(groups), group => {
                            return _.map(group, g => <div className='TeamName' key={g.localID}>
                                <div className={deleteVisible === g.localID ? "ConfirmDelete" : "Hidden"}>
                                    <p>Delete team?</p>
                                    <div>
                                        <TiTick style={{cursor: "pointer"}} onClick={() => deleteTeam(g)} />
                                        <MdCancel style={{cursor: "pointer"}} onClick={() => setDeleteVisible(0)} />
                                    </div>
                                </div>
                                <p>{g.name}</p>
                                <div>
                                    <MdDeleteForever style={{cursor: "pointer"}} onClick={() => setDeleteVisible(g.localID)} />
                                </div>
                            </div>)
                        })}
                    </div>
                </>}
            </div>
            {!displayKnockouts ? <div className="GroupContainer">
                {renderGroups}
                <div className='KnockoutContainer'>
                    <div className={qualifiersOne.length === 2 && qualifiersTwo.length === 2 && qualifiersThree.length === 2 && qualifiersFour.length === 2  ? 'KnockoutButton' : 'KnockoutButton Disabled'} onClick={() => {
                        if (qualifiersOne.length === 2 && qualifiersTwo.length === 2 && qualifiersThree.length === 2 && qualifiersFour.length === 2) {
                            setDisplayKnockouts(true)
                        }
                    }}>
                        <p>Knockouts</p>
                        <FaArrowRight />
                    </div>
                </div>
            </div> : <Knockout qualifiersOne={qualifiersOne} qualifiersTwo={qualifiersTwo} qualifiersThree={qualifiersThree} qualifiersFour={qualifiersFour} setDisplayKnockouts={() => setDisplayKnockouts(false)} />}
        </main>
    </div>
  )
}

export default Groups
