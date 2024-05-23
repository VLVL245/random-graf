'use client'

import { useState } from "react"
import Header from "./component/Header"
import Main from "./component/Main"

export default function StartPage() {

	const [widthFieldSize, setWidthFieldSize] = useState<number>(0)
	const [heightFieldSize, setHeightFieldSize] = useState<number>(0)
	const [amountPoints, setAmountPoints] = useState<number>(0)
	const [randomSeed, setRandomSeed] = useState<number>(0)

	function getFieldSizes(fieldWidth: number, fieldHeight: number,) {
		setWidthFieldSize(fieldWidth)
		setHeightFieldSize(fieldHeight)
	}
	function getDataUser(amountPoints: number, randomSeed: number) {
		setAmountPoints(amountPoints)
		setRandomSeed(randomSeed)
	}

	return(
		<>
		<Header getFieldSizes={getFieldSizes} getDataUser={getDataUser}/>
		<Main amountPoints={amountPoints} randomSeed={randomSeed} widthFieldSize={widthFieldSize} heightFieldSize={heightFieldSize}/>
		</>
	)
}