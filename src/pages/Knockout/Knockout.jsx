import React, { useEffect, useState, useMemo } from 'react'
import "./Knockout.scss"
import _ from "lodash"
import { FaArrowLeft } from "react-icons/fa";

const Knockout = ({qualifiersOne, qualifiersTwo, qualifiersThree, qualifiersFour, setDisplayKnockouts}) => {
    const [semiFinalists, setSemiFinalists] = useState([])
    const [finalists, setFinalists] = useState([])
    const [winner, setWinner] = useState({})

    const setSemis = (winner, loser) => {
        let _semiFinalists = _.filter(semiFinalists, team => team.localID !== loser.localID)
        _semiFinalists.push(winner)
        setSemiFinalists(_semiFinalists)
    }

    const setFinal = (winner, loser) => {
        let _finalists = _.filter(finalists, team => team.localID !== loser.localID)
        _finalists.push(winner)
        setFinalists(_finalists)
    }

    const renderSemiFinal = useMemo(() => {
        if (semiFinalists.length === 4) {
            return (
                <>
                    <div className="QFixture">
                        <p className={_.includes(_.map(finalists, f => f.localID), semiFinalists[0].localID) ? "Highlight" : ""} onClick={() => setFinal(semiFinalists[0], semiFinalists[2])}>{_.get(semiFinalists[0], "name")}</p>
                        <p style={{color: "white"}}>vs</p>
                        <p className={_.includes(_.map(finalists, f => f.localID), semiFinalists[2].localID) ? "Highlight" : ""} onClick={() => setFinal(semiFinalists[2], semiFinalists[0])}>{_.get(semiFinalists[2], "name")}</p>
                    </div>
                    <div className="QFixture">
                        <p className={_.includes(_.map(finalists, f => f.localID), semiFinalists[1].localID) ? "Highlight" : ""} onClick={() => setFinal(semiFinalists[1], semiFinalists[3])}>{_.get(semiFinalists[1], "name")}</p>
                        <p style={{color: "white"}}>vs</p>
                        <p className={_.includes(_.map(finalists, f => f.localID), semiFinalists[3].localID) ? "Highlight" : ""} onClick={() => setFinal(semiFinalists[3], semiFinalists[1])}>{_.get(semiFinalists[3], "name")}</p>
                    </div>
                </>
            )
        }
        return null
    }, [finalists, semiFinalists])

  return (
    <div className='Knockouts'>
        <div className="Round">
            <h1>Quarter-Finals</h1>
            <div className="QFixtureContainer">
                <div className="QFixture">
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersOne[0].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersOne[0], qualifiersTwo[1])}>{_.get(qualifiersOne[0], "name")}</p>
                    <p style={{color: "white"}}>vs</p>
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersTwo[1].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersTwo[1], qualifiersOne[0])}>{_.get(qualifiersTwo[1], "name")}</p>
                </div>
                <div className="QFixture">
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersTwo[0].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersTwo[0], qualifiersOne[1])}>{_.get(qualifiersTwo[0], "name")}</p>
                    <p style={{color: "white"}}>vs</p>
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersOne[1].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersOne[1], qualifiersTwo[0])}>{_.get(qualifiersOne[1], "name")}</p>
                </div>
                <div className="QFixture">
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersThree[0].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersThree[0], qualifiersFour[1])}>{_.get(qualifiersThree[0], "name")}</p>
                    <p style={{color: "white"}}>vs</p>
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersFour[1].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersFour[1], qualifiersThree[0])}>{_.get(qualifiersFour[1], "name")}</p>
                </div>
                <div className="QFixture">
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersFour[0].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersFour[0], qualifiersThree[1])}>{_.get(qualifiersFour[0], "name")}</p>
                    <p style={{color: "white"}}>vs</p>
                    <p className={_.includes(_.map(semiFinalists, f => f.localID), qualifiersThree[1].localID) ? "Highlight" : ""} onClick={() => setSemis(qualifiersThree[1], qualifiersFour[0])}>{_.get(qualifiersThree[1], "name")}</p>
                </div>
            </div>
        </div>
        <div className="Round">
            <h1>Semi-Finals</h1>
            <div className="QFixtureContainer Semi">
                {renderSemiFinal}
            </div>
        </div>
        <div className="Round">
            <h1>Final</h1>
            <div className="QFixtureContainer">
                {finalists.length === 2 && <div className="QFixture">
                    <p className={_.get(winner, "localID") === _.get(finalists[0], "localID") ? "Highlight" : ""} onClick={() => setWinner(finalists[0])}>{_.get(finalists[0], "name")}</p>
                    <p style={{color: "white"}}>vs</p>
                    <p className={_.get(winner, "localID") === _.get(finalists[1], "localID") ? "Highlight" : ""} onClick={() => setWinner(finalists[1])}>{_.get(finalists[1], "name")}</p>
                </div>}
            </div>
        </div>
        <div className='GroupButtonContainer'>
            <div className='GroupButton' onClick={() => setDisplayKnockouts(true)}>
                <FaArrowLeft />
                <p>Groups</p>
            </div>
        </div>
    </div>
  )
}

export default Knockout
