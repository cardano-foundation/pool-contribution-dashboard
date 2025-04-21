"use client"

import { useState } from "react";

import {SearchFormProps} from "@/types/types"; 

//Handles the user input for poolId, epoch and used margin to calculate the rewards.
export default function SearchForm({onSearch} : SearchFormProps) {
    //Default poolId is the id for the UNHCR Pool
    const [poolId, setPoolId] = useState("pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw");
    const [epoch, setEpoch] = useState(428);
    const [margin, setMargin] = useState(0.03);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch({poolId, epoch, margin});
    };


    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw" className="border p-2 rounded-md" value={poolId} onChange={(e) => setPoolId(e.target.value) }/>
            <input type="number" placeholder="epoch" className="border p-2 rounded-md" value={epoch} onChange={(e) => setEpoch(e.target.valueAsNumber) }/>
            <input type="number" placeholder="0.03" className="border p-2 rounded-md" value={margin} onChange={(e) => setMargin(e.target.valueAsNumber) }/>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>  
        </form>
    )
}