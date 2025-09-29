'use client';

import { useState } from 'react';
import { TournamentWithOrganizer } from '@/lib/types/tournament';

export function useTournamentModal() {
  const [selectedTournament, setSelectedTournament] = useState<TournamentWithOrganizer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (tournament: TournamentWithOrganizer) => {
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
