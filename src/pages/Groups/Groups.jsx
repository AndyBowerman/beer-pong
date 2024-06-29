import React, { useState, useEffect } from 'react'
import { Button, Input, InputNumber } from 'antd';
import './Groups.scss'
import Table from '../../containers/Table/Table';

const Groups = () => {
    const [teamName, setTeamName] = useState("")
    const [teams, setTeams] = useState([])
    const [groupNum, setGroupNum] = useState(4)

    const enterTeam = () => {
        const team = {
            name: teamName,
            group: 1,
            played: 0,
            won: 0,
            lost: 0,
            pointsDifference: 0
        }

        setTeams([...teams, team])

        setTeamName("")
    }

    useEffect(() => {
        console.log(teams)
    }, [teams])

    const renderGroups = () => {
        const groups = []
        for (let i = 1; i <= groupNum; i++) {
            groups.push(
                <div className="Group" key={i}>
                    <Table teams={teams.filter(team => team.group === i)} />
                </div>
            )
        }

        console.log(groups)
        return groups
    }

  return (
    <div className='Groups'>
        <header className='Header'>
            <div className='EnterTeams'>
                <Input placeholder="Enter team name" onChange={(e) => setTeamName(e.target.value)} value={teamName} />
                <Button onClick={enterTeam} type="primary">Enter</Button>
            </div>
            <div className='GroupsNumber'>
                <p className='GroupsNumberLabel'>How many groups?</p>
                <InputNumber value={groupNum} onChange={(e) => setGroupNum(e)} />
            </div>
        </header>

        <main className='Main'>
            {groupNum > 0 && renderGroups()}
        </main>
    </div>
  )
}

export default Groups
