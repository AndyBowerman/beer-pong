import React from 'react'
import _ from "lodash"
import './Fixtures.scss'
import { InputNumber } from 'antd'

const Fixtures = ({fixture, recordScores, teamOne, teamTwo}) => {
  return (
    <div className='Fixture'>
      <div className="FixtureTeam">
          <p>{_.get(teamOne, "name", "")}</p>
          <InputNumber className='InputScore' value={_.get(fixture, "teamOneScore")} onChange={(e) => recordScores({...fixture, teamOneScore: e})} />
      </div>
      <p>vs</p>
      <div className="FixtureTeam">
          <InputNumber className='InputScore' value={_.get(fixture, "teamTwoScore")} onChange={(e) => recordScores({...fixture, teamTwoScore: e})} />
          <p>{_.get(teamTwo, "name")}</p>
      </div>
    </div>
  )
}

export default Fixtures
