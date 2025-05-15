"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { emotionStorage } from "@/lib/storage-service";
import React from "react";
import { getEmoji } from "@/constants/emoji";

const EmotionHistory = () => {
  const emotionHistory = emotionStorage.getEmotionHistory();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Emotion History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Emoji</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emotionHistory.map((history, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{history.emotion}</TableCell>
              <TableCell>{(Number(history.confidence) * 100).toFixed(2)} %</TableCell>
              <TableCell>{history.timestamp.toLocaleString()}</TableCell>
              <TableCell>{getEmoji(history.emotion)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmotionHistory;
