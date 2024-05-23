'use client'

import { useEffect, useMemo, useState } from "react"
import {Button, Input, Link} from "@nextui-org/react";

interface GetField {
	getFieldSizes: (fieldSizesX: number, fieldSizesY: number) => void
	getDataUser: (amountPoints: number, randomSeed: number) => void
}

export default function Header({getFieldSizes, getDataUser} : GetField) {

	const [amountPoints, setAmountPoints] = useState<string>('')
	const [fieldSizesX, setFieldSizesX] = useState<string>('')
	const [fieldSizesY, setFieldSizesY] = useState<string>('')
	const [screenSizeX, setScreenSizeX] = useState<number>(0)
	const [screenSizeY, setScreenSizeY] = useState<number>(0)
	const [randomSeed, setRandomSeed] = useState<string>('')

	function sendData() {
		getFieldSizes(Number(fieldSizesX), Number(fieldSizesY))
		getDataUser(Number(amountPoints), Number(randomSeed))
	}

	const validForm = useMemo(() => {
		if (Number(amountPoints) <= 0 || amountPoints === '') return true
		if (Number(fieldSizesX) <= 0 || fieldSizesX === '') return true
		if (Number(fieldSizesY) <= 0 || fieldSizesY === '') return true
		if (Number(randomSeed) <= 0 || randomSeed === '') return true

		return false
	},[amountPoints, fieldSizesX, fieldSizesY, randomSeed])

	useEffect(() => {
		setScreenSizeX(window.innerWidth)
		setScreenSizeY(window.innerHeight)
	}, [])

	return(
		<header className="mt-6 max-h-36">
			<div className="container mx-auto flex gap-4 justify-between">
				<div>
					<Input
					isRequired
					isInvalid={(Number(amountPoints) <= 0) ? true : false} 
					value={amountPoints || ''}
					onChange={(e) => setAmountPoints(e.target.value)}
					type="number"
					label="Amount of points"
					errorMessage="The number must be greater than 0"
					className="max-w-xs"
					/>
				</div>
				<div>
					<Input
					isRequired
					isInvalid={(Number(fieldSizesX) <= 0 || Number(fieldSizesX) >= screenSizeX) ? true : false}
					value={fieldSizesX}
					onChange={(e) => setFieldSizesX(e.target.value)}
					type="number"
					label="Field size X"
					errorMessage={`The number must be greater than 0 and max number ${screenSizeX}`}
					className="max-w-xs"
					/>
				</div>
				<div>
					<Input
					isRequired
					isInvalid={(Number(fieldSizesY) <= 0 || Number(fieldSizesY) >= (screenSizeY - 168)) ? true : false}
					value={fieldSizesY}
					onChange={(e) => setFieldSizesY(e.target.value)}
					type="number"
					label="Field size Y"
					errorMessage={`The number must be greater than 0 and max number ${screenSizeY - 168}`}
					className="max-w-xs"
					/>
				</div>
				<div>
					<Input
					isRequired
					isInvalid={(Number(randomSeed) <= 0) ? true : false}
					value={randomSeed}
					onChange={(e) => setRandomSeed(e.target.value)}
					type="number"
					label="Random seed"
					errorMessage="The number must be greater than 0"
					className="max-w-xs"
					/>
				</div>
			</div>
			<div className="container mx-auto flex justify-center">
				{ validForm === true ? (
				<Button isDisabled>Paint</Button>
				) : (
				<Button as={Link} onClick={() => sendData()}>Paint</Button>)
				}
			</div>
		</header>
	)
}