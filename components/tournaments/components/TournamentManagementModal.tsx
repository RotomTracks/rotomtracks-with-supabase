'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import TDFDownloadManager from '../utils/TDFDownloadManager';
import PlayerManagement from './PlayerManagement';
import TournamentSettings from './TournamentSettings';
import { TournamentParticipant, TournamentWithOrganizer } from '@/lib/types/tournament';
import { Settings, Users, Download, Trash2 } from 'lucide-react';
import { useTypedTranslation } from '@/lib/i18n/hooks/useTypedTranslation';

interface TournamentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentWithOrganizer;
  participants: TournamentParticipant[];
  onParticipantUpdate: () => void;
  onTournamentUpdate: () => void;
  onTournamentDelete?: () => void;
}

export default function TournamentManagementModal({
  isOpen,
  onClose,
  tournament: initialTournament,
  participants: initialParticipants,
  onParticipantUpdate,
  onTournamentUpdate,
  onTournamentDelete
}: TournamentManagementModalProps) {
  const { tTournaments } = useTypedTranslation();
  const [tournament, setTournaments] = useState(initialTournament);
  const [participants, setParticipants] = useState(initialParticipants);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate statistics
  const totalCount = participants.length;

  useEffect(() => {
    setTournaments(initialTournament);
    setParticipants(initialParticipants);
  }, [initialTournament, initialParticipants]);

  const handleParticipantUpdate = async () => {
    setLoading(true);
    try {
      await onParticipantUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentUpdate = async () => {
    setLoading(true);
    try {
      await onTournamentUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!onTournamentDelete) return;
    
    setIsDeleting(true);
    try {
      await onTournamentDelete();
      onClose(); // Close the modal after successful deletion
    } catch (error) {
      console.error('Error deleting tournament:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{tournament.name} - {tTournaments('management.title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Management Accordion */}
            <Accordion type="single" collapsible className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Tournament Settings - First */}
              <AccordionItem value="settings" className="border-0 border-b border-gray-200 dark:border-gray-700">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">{tTournaments('management.settings')}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">- {tTournaments('management.tournamentDetails')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <TournamentSettings
                    tournament={tournament as any}
                    onTournamentUpdate={handleTournamentUpdate}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Participants Management - Second */}
              <AccordionItem value="participants" className="border-0 border-b border-gray-200 dark:border-gray-700">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{tTournaments('management.participants')}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({tTournaments('management.participantsCount', { count: totalCount })})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PlayerManagement
                    tournamentId={tournament.id}
                    participants={participants}
                    onParticipantUpdate={handleParticipantUpdate}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* TDF Generation - Third */}
              <AccordionItem value="tdf" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span className="font-medium">{tTournaments('management.tdfGeneration')}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">- {tTournaments('management.downloadFiles')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <TDFDownloadManager
                    tournament={tournament as TournamentWithOrganizer}
                    participants={participants}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Delete Tournament Section */}
            {onTournamentDelete && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {tTournaments('management.deleteSection.title')}
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                          {tTournaments('management.deleteSection.description')}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-300 bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 dark:border-red-700 dark:bg-red-800/30 dark:text-red-200 dark:hover:bg-red-700/40 dark:hover:text-red-100 px-4 py-2"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? tTournaments('management.deleting') : tTournaments('management.delete')}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            <span>{tTournaments('management.deleteConfirm.title')}</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="text-left space-y-3">
                              <p>{tTournaments('management.deleteConfirm.warning')}</p>
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                  {tTournaments('management.deleteConfirm.tournamentName')}: <span className="font-bold">{tournament.name}</span>
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                  {tTournaments('management.deleteConfirm.participantsCount', { count: participants.length })}
                                </p>
                              </div>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {tTournaments('management.deleteConfirm.notification')}
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            {tTournaments('management.deleteConfirm.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteTournament}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {tTournaments('management.deleting')}
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {tTournaments('management.deleteConfirm.confirm')}
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
