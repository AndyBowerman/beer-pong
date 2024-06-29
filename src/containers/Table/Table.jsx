import React, { useEffect } from 'react'
import './Table.scss'
const Table = ({ teams }) => {

    useEffect(() => {
        console.log(teams)
    }, [teams])

  return (
    <div className='Table'>
      hello
    </div>
  )
}

export default Table
