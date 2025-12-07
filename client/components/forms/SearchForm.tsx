"use client"

//Currently not used

import { useState } from "react";
import {SearchFormProps} from "@/types/types"; 
import { useConfig } from "@/app/context/configContext";

//Handles the user input for poolId, epoch and used margin to calculate the rewards.
export default function SearchForm({onSearch} : SearchFormProps) {
    const { poolId } = useConfig();
    const [epoch, setEpoch] = useState(428);
    const [margin, setMargin] = useState(0.03);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!poolId) {
            throw new Error('POOL_ID ist not set in .evn.local!');
        }
        onSearch({poolId, epoch, margin});
    };


    return (
        <form onSubmit={handleSubmit}>
            <input type="number" placeholder="epoch" className="border p-2 rounded-md" value={epoch} onChange={(e) => setEpoch(e.target.valueAsNumber) }/>
            <input type="number" placeholder="0.03" className="border p-2 rounded-md" value={margin} onChange={(e) => setMargin(e.target.valueAsNumber) }/>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>  
        </form>
    )
}