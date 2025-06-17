"use client";

import SimpleLineGraph from "@/components/forms/simpleLineGraph";
import {useRewardData} from "@/components/hooks/useData"

export default function Home() {

  const { data, loading, error } = useRewardData();

  if (loading) return <p>Lade Daten...</p>;
  if (error) return <p>Fehler beim Laden: {error}</p>;
  if (!data) return <p>Keine Daten vorhanden</p>;
   
    return (
     <div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
