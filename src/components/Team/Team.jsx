import React, { useEffect } from 'react'
import './Team.scss'

const Team = ({team}) => {

  const { name, played, goalDifference, points } = team

  return (
    <div className='Team'>
      <div>{name}</div>
      <div className="Mid">{played}</div>
      <div className="Mid">{goalDifference}</div>
      <div className="Mid">{points}</div>
    </div>
  )
}

export default Team
