'use client';

import { useState } from 'react';
import { Tournament } from '@/lib/types/tournament';

export function useTournamentModal() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTournament(null);
  };

  return {
    selectedTournament,
    isModalOpen,
    openModal,
    closeModal
  };
}
