/**
 * @file Allows the user to enter a delegation and calcualtes an estimated reward based on the previous epoch
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { useState, type ChangeEvent } from 'react';
import { ExchangeValue, PoolHistory } from "@/types/types";
import Big from 'big.js';
import LoadingSpinner from './LoadingSpinner';
import { useCurrency } from '@/app/context/currencyContext';
import { calculateValueWithExchangeRate } from '../logic/currencyCalculator';

/**
 * Props for the CalculatorCard component.
 * @interface CardProps
 * @property {string} title - The title displayed at the top of the card.
 * @property {React.ReactNode} children - Child elements to be rendered within the card's content area.
 * @property {string} [className=''] - Optional additional CSS classes for custom styling.
 * @property {string} [height='h-auto'] - Optional CSS class to control the card's height.
 * @property {boolean} [scrollable=false] - If true, enables vertical scrolling for the card's content.
 * @property {{ calculatorData: PoolHistory | null, calculatorLoading: boolean, calculatorError: String | null }} data - Object containing pool history data, loading state, and error.
 * @property {ExchangeValue} exchangeRate - The current exchange rate for currency conversions.
 */
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: { calculatorData: PoolHistory | null, calculatorLoading: boolean, calculatorError: string | null },
  exchangeRate: ExchangeValue
}

/**
 * A card component that provides a reward calculator for delegators.
 * It allows users to input a delegation value and calculates the estimated reward based on pool history data.
 * Displays loading or error states if data fetching is in progress or fails.
 *
 * @param {CardProps} { title, children, className, height, scrollable, data, exchangeRate } - Props for the component.
 * @returns {JSX.Element} A React component displaying the delegation calculator.
 */
export function CalculatorCard({ title, children, className = '', height = 'h-auto', scrollable = false, data, exchangeRate }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  const usedData = data.calculatorData;

  const { currency } = useCurrency();

  const [input, setInput] = useState<string>("");
  const [inputError, setInputError] = useState<string>("")
  const [result, setResult] = useState<string>("0");
  
  if (data.calculatorLoading) return (
    <div className={`bg-cf-gray rounded-2xl shadow-[0_14px_50px_0_rgba(3,36,67,0.1)] p-6 ${height} ${scrollClasses} ${className}`}>
      <LoadingSpinner
        bigCircleDiameter={100}
        smallCircleDiameter={90}
        animationDuration={1}
      />
    </div>
  );
  if (data.calculatorError) return <p>Fehler beim Laden: {data.calculatorError}</p>;
  if (!usedData) return <p>Keine Daten vorhanden</p>;


  const validateNumberInput = (value: string, setError: React.Dispatch<React.SetStateAction<string>>): boolean => {

    let cleanedInput = value.trim();

    //Check if value is empty
    if (cleanedInput === '') {
      //Clear error if input is empty
      setError('');
      //Consider empty as not "valid" for calculation purposes yet 
      return false;
    }


    //Input contains only numbers and max one .
    if (!/^[0-9]*\.?[0-9]*$/.test(cleanedInput)) {
      setError('Invalid symbols')
      return false;
    }

    //Checking for double . (for safety)
    if (cleanedInput.split('.').length > 2) {
      setError('More thane one . found')
      return false;
    }

    //Edge case only on . in total
    if (cleanedInput === ".") {
      setError('Not a number')
      return false;
    }

    //If input starts with . like in .5
    if (cleanedInput.startsWith(".")) {
      cleanedInput = 0 + cleanedInput
    }

    //No negative values allowed
    if (cleanedInput.startsWith('-')) {
      setError('Delegation must be positive')
      return false;
    }

    const [integerPart, fractionalPart] = cleanedInput.split('.');
    const finalFractionalPart = fractionalPart || "";

    if (finalFractionalPart.length > 6) {
      setError('More than 6 decimals')
      return false;
    }

    const paddedFractionalPart = finalFractionalPart.padEnd(6, '0');

    const lovelaceString = integerPart + paddedFractionalPart;

    let bigNum: Big;
    try {
      bigNum = new Big(lovelaceString);
    } catch {
      setError('Internal conversion error');
      return false;
    }

    if (bigNum.eq(Big(0))) {
      setError('Cant be 0')
      return false;
    }

    if (!bigNum.gt(Big(0))) {
      setError('Smaller than 0');
      return false;
    }

    const totalLovelace = Big("45000000000000000");
    const reserves = Big(usedData.reserves)
    const adaInCirculation = totalLovelace.minus(reserves)

    //Check if the new delegation would saturate the pool
    const optimalPoolCount = Big(usedData.optimal_pool_count)
    const poolSaturationLimit = adaInCirculation.div(optimalPoolCount).round(0, 1);

    const newPoolStake = Big(usedData.active_stake).add(bigNum)

    const poolSaturation = (newPoolStake.div(poolSaturationLimit)).times(Big(100)).round(2, 1)

    if (poolSaturation.gt(Big(100))) {
      setError('Pool would be saturated to over 100%. Saturation is: ' + poolSaturation + "%.")
      return false;
    }

    setError('')
    return true;
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);
    validateNumberInput(value, setInputError);
  };

  const handleCalculate = () => {

    try {

      //Convert input to lovelace depending on the input (not ., how many spaces after . (fill with zeros), etc.)
      const cleanedInput = input.trim();

      const [integerPart, fractionalPart] = cleanedInput.split('.');
      const finalFractionalPart = fractionalPart || "";

      const paddedFractionalPart = finalFractionalPart.padEnd(6, '0');

      const lovelaceString = integerPart + paddedFractionalPart;

      const delegation = Big(lovelaceString);
      //console.log("Delegation is: " + delegation.toString())

      //TODO!! Owner could have a lower stake than the pledge. This is currently ignored

      //poolStake
      const poolStake = Big(usedData.active_stake)
      //console.log("Original Stake is: " + poolStake.toString())

      //Adds the entered delegation to the pools active stake
      const newPoolStake = poolStake.add(delegation)
      //console.log("new Stake is: " + newPoolStake.toString())

      //poolFixedCost
      const poolFixedCost = Big(usedData.fixed_cost)
      //oben: kommt alles aus der poolHistory

      //poolPledge
      const poolPledge = Big(usedData.pledge)
      //console.log("Pledge is: " + poolPledge.toString())

      //Has to be updated according to the new delegation. Input validation stops the value from being over the global ada limit
      const totalActiveStake = Big(usedData.total_active_stake).add(delegation)
      //console.log("Total active stake is: " + totalActiveStake.toString())

      //totalBlocks this epoch
      const totalBlocksThisEpoch = Big(usedData.total_block_count)
      //console.log("Total blocks this epoch is: " + totalBlocksThisEpoch.toString())

      /*    
      For that I will calculate the expected Blocks like this: ((poolStake + simulatedDelegation)/(totalActiveStake + simulatedDelegation))*totalBlocksThisEpoch
      */
      const relativeEffectOfPool = newPoolStake.div(totalActiveStake)
      //console.log("Relative effect of pool is: " + relativeEffectOfPool.toString())


      //Blocks
      const realPoolBlocks = Big(usedData.block_cnt)

      let expectedBlocks = relativeEffectOfPool.times(totalBlocksThisEpoch).round(0, 1)

      expectedBlocks = realPoolBlocks.lt(expectedBlocks) ? expectedBlocks : realPoolBlocks

      //console.log("Expected Blocks are " + expectedBlocks.toString())

      const relativeBlocksInEpoch = expectedBlocks.div(totalBlocksThisEpoch)
      //console.log("Relative Blocks are " + relativeBlocksInEpoch.toString())
      const relativeActiveStake = newPoolStake.div(totalActiveStake)
      //console.log("Relative active stake is: " + relativeActiveStake.toString())

      const poolPerformance = relativeBlocksInEpoch.div(relativeActiveStake)

      //console.log("Pool performance should be: " + poolPerformance.toString())

      //decentralizationParameter
      const decentralisation = Big(usedData.decentralisation)

      const totalLovelace = Big("45000000000000000");

      const reserves = Big(usedData.reserves);

      const adaInCirculation = totalLovelace.minus(reserves);
      //console.log("Lovelace in circulation is: " + adaInCirculation.toString())

      //relativeStakeOfPoolOwner = (poolPledge/adaInCirculation)
      const relativeStakeOfPoolOwner = poolPledge.div(adaInCirculation)
      //console.log("Relative stake of pool owner is " + relativeStakeOfPoolOwner.toString())

      //relativeStakeOfPool = ((poolStake + newDelegation)/adaInCirculation)
      const relativeStakeOfPool = newPoolStake.div(adaInCirculation)
      //console.log("Relative stake of pool is " + relativeStakeOfPool.toString())

      //optimalPoolCount (For saturation)
      const optimalPoolCount = Big(usedData.optimal_pool_count)
      //console.log("Optimal pool count is " + optimalPoolCount.toString())

      //______________________Reward pot calculation____________________

      //console.log("");

      const activeSlotCoeff = Big(usedData.active_slot_coeff)
      //console.log("activeSlotCoeff: " + activeSlotCoeff.toString());

      const expectedSlotsPerEpoch = Big(usedData.epoch_length_in_slots);
      //console.log("expectedSlotsPerEpoch: " + expectedSlotsPerEpoch.toString());

      let eta = Big(0);

      const decentrThreshold = Big(0.8);

      if (decentrThreshold.lt(decentralisation)) {
        eta = Big(1)
      } else {
        const expectedBlocksInNonOBFTSlots = expectedSlotsPerEpoch.times(activeSlotCoeff).times(Big(1).minus(decentralisation))
        //console.log("expectedBlocksInNonOBFTSlots" + expectedBlocksInNonOBFTSlots.toString())

        const differenceExpectedReal = totalBlocksThisEpoch.div(expectedBlocksInNonOBFTSlots)

        eta = differenceExpectedReal.lt(Big(1)) ? differenceExpectedReal : Big(1);
      }
      //console.log("eta: " + eta)

      const monetaryExpanseRate = Big(usedData.monetary_expand_rate);
      //console.log("monetaryExpanseRate: " + monetaryExpanseRate.toString());

      const fees = Big(usedData.fees);
      //console.log("fees: " + fees.toString());


      const rewardPot = ((reserves.times(monetaryExpanseRate).times(eta)).add(fees)).round(0, 0)


      //console.log("Total reward pot is " + rewardPot.toString())

      const treasuryGrowthRate = Big(usedData.treasury_growth_rate)

      //console.log("Treasury growth rate: " + treasuryGrowthRate.toString())


      const poolRewardPot = rewardPot.minus((Big(rewardPot).times(treasuryGrowthRate).round(0, 0)))

      //console.log("Reward pot cut for pools: " + poolRewardPot.toString())


      //__________________!Reward pot calculation__________________________

      const influence = Big(usedData.influence)

      //Calculate optimalPoolReward (Best Case)

      const sizeOfASaturatedPool = Big(1).div(optimalPoolCount)
      //console.log("sizeOfASaturatedPool: " + sizeOfASaturatedPool.toString())

      const cappedRelativeStake = relativeStakeOfPool.lt(sizeOfASaturatedPool) ? relativeStakeOfPool : sizeOfASaturatedPool;
      //console.log("cappedRelativeStake: " + cappedRelativeStake.toString())

      const cappedRelativeStakeOfPoolOwner = relativeStakeOfPoolOwner.lt(sizeOfASaturatedPool) ? relativeStakeOfPoolOwner : sizeOfASaturatedPool;
      //console.log("cappedRelativeStakeOfPoolOwner: " + cappedRelativeStakeOfPoolOwner.toString())

      // R / (1+a0)
      const rewardsDividedByOnePlusInfluence = poolRewardPot.div(Big(1).add(influence))
      //console.log("rewardsDividedByOnePlusInfluence: " + rewardsDividedByOnePlusInfluence.toString())

      // (z0 - sigma') / z0
      const relativeStakeOfSaturatedPool = (sizeOfASaturatedPool.minus(cappedRelativeStake)).div(sizeOfASaturatedPool);
      //console.log("relativeStakeOfSaturatedPool: " + relativeStakeOfSaturatedPool.toString())

      // (sigma' - s' * relativeStakeOfSaturatedPool) / z0
      const saturatedPoolWeight = (cappedRelativeStake.minus(cappedRelativeStakeOfPoolOwner.times(relativeStakeOfSaturatedPool))).div(sizeOfASaturatedPool)
      //console.log("saturatedPoolWeight: " + saturatedPoolWeight.toString())

      // R / (1+a0) * (sigma' + s' * a0 * saturatedPoolWeight)
      const optimalPoolReward = rewardsDividedByOnePlusInfluence.times(cappedRelativeStake.add(cappedRelativeStakeOfPoolOwner.times(influence).times(saturatedPoolWeight))).round(0, 1)
      //console.log("optimalPoolReward: " + optimalPoolReward.toString())

      //Most of the time 1
      const realPoolReward = optimalPoolReward.times(poolPerformance).round(0, 1)

      //console.log("Real pool reward: " + realPoolReward.toString())

      //________________Calculate Pool Saturation______________
      //const poolSaturationLimit = adaInCirculation.div(optimalPoolCount).round(0, 1);

      //console.log("Pool Saturation Limit is: " + poolSaturationLimit.toString() + " lvl")

      //const poolSaturation = (newPoolStake.div(poolSaturationLimit)).times(Big(100)).round(2, 1)

      //console.log("Pool is saturated to " + poolSaturation.toString() + "%.")

      if (realPoolReward.lte(poolFixedCost)) {
        setResult("+0 Ada")
        //If pool rewards are enough for delegator rewards
      } else {

        const m1 = realPoolReward.minus(poolFixedCost);

        //console.log("New Pool Stake" + newPoolStake.toString())

        const m2 = (Big(1).minus(Big(usedData.margin)));
        const div1 = (newPoolStake.div(adaInCirculation));
        const div2 = (delegation.div(adaInCirculation));
        const m3 = (div2.div(div1));

        let reward = (m1.times(m2)).times(m3);

        reward = reward.round(0, 1)

        let cleanedReward = reward.toString()

        cleanedReward = cleanedReward.replace(/[^0-9]/g, '');

        // if string is empty or 0
        if (cleanedReward === '' || cleanedReward === '0') {
          return "0.000000";
        }

        // Add zeros for correct lovelace length
        while (cleanedReward.length < 7) {
          cleanedReward = "0" + cleanedReward;
        }

        //Add decimal point
        const integerPart = cleanedReward.slice(0, -6);
        const fractionalPart = cleanedReward.slice(-6);

        //Build string
        cleanedReward = `${integerPart}.${fractionalPart}`;

        //console.log(cleanedReward)

        setResult(cleanedReward)
      }

    } catch (error) {
      if (error instanceof Error) {
        // If it's an instance of the built-in Error class
        console.error("Caught an Error object:", error.message + " ");
      } else if (typeof error === 'string') {
        // If it's a string
        console.error("Caught a string error:", error);
      } else if (typeof error === 'number') {
        // If it's a number
        console.error("Caught a number error:", error);
      } else {
        // For any other unknown type of error
        console.error("Caught an unexpected type of error:", error);
      }
    }
  }

  const isButtonDisabled: boolean = (!!inputError || input.trim() === '');

  return (
    <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl 
                      shadow-[0_14px_50px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_14px_50px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='mb-6 text-gray-400 text-xs'>Uses data from 2 epochs ago</p>
      <p className='text-xl mb-2 text-cf-text dark:text-cf-gray transition-colors duration-200'>Possible Reward</p>
      <p className="text-green-600 mb-10 text-4xl">{currency === "ada" ? "+" + result + " ₳" : "+" + calculateValueWithExchangeRate(exchangeRate.cardano.usd, Big(result)) + " $"}</p>
      <div className="text-cf-text dark:text-cf-gray transition-colors duration-200">
        <div className='rounded-lg'>
          <div>
            <label className={`block ${!!inputError ? "mb-0" : "mb-4"}`}>
              <div className="flex items-stretch rounded-[10px] shadow-[0_1px_4px_0_rgba(3,36,67,0.15)] dark:shadow-[0_3px_8px_0px_rgba(23,23,23,0.24)]
                              ${inputError ? 'focus-visible:shadow-[0_1px_4px_0_rgba(3,36,67,0.15),inset_0_0_0_2px_rgb(251_44_54)]' : 'focus-visible:shadow-[0_1px_4px_0_rgba(3,36,67,0.15),inset_0_0_0_2px_rgb(153_161_175)]'}
              ">
                <input
                  className={`
                    
                    py-3
                    pl-3
                    rounded-l-[10px]
                    w-full
                    active: outline-none
                    text-cf-text
                    dark:text-cf-gray
                    placeholder-cf-text
                    dark:placeholder-cf-gray
                    transition-colors duration-1000
                    placeholder-opacity-75
                    ${inputError ? 'focus-visible:border-transparent focus-visible:shadow-[inset_0_0_0_2px_rgb(251_44_54)]' : 'focus-visible:border-transparent focus-visible:shadow-[inset_0_0_0_2px_rgb(153_161_175)]'}
                  `}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Delegation Value"
                />
                <div
                  className="
                    py-3
                    px-3
                    rounded-r-[10px]
                    rounded-l-none
                    flex
                    items-center
                    text-cf-text
                    dark:text-cf-gray
                    transition-colors duration-200
                    
                    "
                >
                  ₳
                </div>
              </div>
              {inputError && <div className="text-red-500 text-sm mt-1">{inputError}</div>}
            </label>
            <button
              onClick={handleCalculate}
              disabled={isButtonDisabled}
              className=' 
                          px-4 
                          py-2
                        bg-cf-gray
                          dark:bg-cf-text
                        text-cf-text
                          dark:text-cf-gray
                          rounded-[10px]
                          shadow-[0_4px_10px_0_rgba(3,36,67,0.24)]
                          dark:shadow-[0_2px_10px_0px_rgba(23,23,23,0.24)]
                        hover:bg-gray-200
                          dark:hover:bg-[#303030]
                          transition-colors duration-200
                          cursor-pointer

                        disabled:bg-gray-300
                        dark:disabled:bg-[#303030]
                        disabled:text-gray-500
                          dark:disabled:text-cf-gray
                          disabled:opacity-75
                          disabled:shadow-none
                          disabled:cursor-not-allowed'
            >
              Calculate Reward
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};