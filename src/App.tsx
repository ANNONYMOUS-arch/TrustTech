import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MarketplaceView } from './components/MarketplaceView';
import { DeveloperVerificationView } from './components/DeveloperVerificationView';
import { BusinessDashboard } from './components/BusinessDashboard';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ApplyModal } from './components/ApplyModal';
import { CommunicationModal } from './components/CommunicationModal';
import { ProjectMilestonesModal } from './components/ProjectMilestonesModal';
import { DisputeModal } from './components/DisputeModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { CodingStudioView } from './components/CodingStudioView';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { FinancialCentreView } from './components/FinancialCentreView';
import { Footer } from './components/Footer';
import { store, MarketplaceState } from './services/store';
import { Project, Milestone } from './types';

export default function App() {
  const [state, setState] = useState<MarketplaceState>(() => store.getState());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modals state
  const [applyModalProject, setApplyModalProject] = useState<Project | null>(null);
  const [chatProjectId, setChatProjectId] = useState<string | null>(null);
  const [milestonesProjectId, setMilestonesProjectId] = useState<string | null>(null);
  const [disputePayload, setDisputePayload] = useState<{ projectId: string; milestoneId: string; milestoneTitle: string } | null>(null);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    project: Project;
    milestone: Milestone;
    developerName: string;
    developerUid: string;
  } | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  const currentUser = state.currentUser;
  const credits = store.getCreditsForUser(currentUser.uid);
  const userDevApplication = state.developerApplications.find(a => a.uid === currentUser.uid);

  // Helper when clicking category on homepage
  const handleSelectCategoryFromHome = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setActiveTab('marketplace');
  };

  const activeChatProject = state.projects.find(p => p.id === chatProjectId);
  const activeMilestonesProject = state.projects.find(p => p.id === milestonesProjectId);
  const activeDisputeProject = disputePayload ? state.projects.find(p => p.id === disputePayload.projectId) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 font-sans selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={state.notifications}
        availableCredits={credits.availableCredits}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            onSelectCategory={handleSelectCategoryFromHome}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HomeView
            onNavigate={setActiveTab}
            onSelectCategory={handleSelectCategoryFromHome}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            projects={state.projects}
            currentUser={currentUser}
            applications={state.projectApplications}
            availableCredits={credits.availableCredits}
            initialCategory={selectedCategoryFilter}
            onOpenApplyModal={proj => setApplyModalProject(proj)}
            onPostProjectClick={() => setActiveTab('dashboard-business')}
          />
        )}

        {activeTab === 'verification' && (
          <DeveloperVerificationView
            currentUser={currentUser}
            application={userDevApplication}
            onNavigateToDashboard={() => setActiveTab('dashboard-developer')}
          />
        )}

        {activeTab === 'dashboard-business' && (
          <BusinessDashboard
            currentUser={currentUser}
            projects={state.projects}
            applications={state.projectApplications}
            onOpenMessages={pId => setChatProjectId(pId)}
            onOpenMilestones={proj => setMilestonesProjectId(proj.id)}
            onNavigateToFinancialCentre={() => setActiveTab('financial-centre')}
          />
        )}


        {activeTab === 'dashboard-developer' && (
          <DeveloperDashboard
            currentUser={currentUser}
            applications={state.projectApplications}
            projects={state.projects}
            availableCredits={credits.availableCredits}
            developerProfile={userDevApplication}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
            onNavigateToVerification={() => setActiveTab('verification')}
            onOpenMessages={pId => setChatProjectId(pId)}
            onOpenMilestones={proj => setMilestonesProjectId(proj.id)}
            onNavigateToFinancialCentre={() => setActiveTab('financial-centre')}
          />
        )}


        {activeTab === 'coding-studio' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CodingStudioView currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'financial-centre' && (
          <FinancialCentreView
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
            onOpenProjectMilestones={pId => setMilestonesProjectId(pId)}
          />
        )}

        {activeTab === 'dashboard-admin' && (
          <AdminDashboard
            currentUser={currentUser}
            applications={state.developerApplications}
            projects={state.projects}
            proposals={state.projectApplications}
            users={state.users}
            disputes={state.disputes}
            departments={state.departments}
            payments={state.payments}
            userReports={state.userReports}
            commissionRate={state.platformCommissionRate}
            onNavigateToFinancialCentre={() => setActiveTab('financial-centre')}
          />
        )}
      </main>



      {/* Proposal Submission Modal */}
      {applyModalProject && (
        <ApplyModal
          project={applyModalProject}
          currentUser={currentUser}
          availableCredits={credits.availableCredits}
          existingApplications={state.projectApplications}
          onClose={() => setApplyModalProject(null)}
          onSuccess={() => {
            setActiveTab('dashboard-developer');
          }}
        />
      )}

      {/* Project Discussion Chat Modal */}
      {chatProjectId && (
        <CommunicationModal
          projectId={chatProjectId}
          currentUser={currentUser}
          project={activeChatProject}
          messages={state.messages}
          onClose={() => setChatProjectId(null)}
        />
      )}

      {/* Project Milestones & Escrow Modal */}
      {activeMilestonesProject && (
        <ProjectMilestonesModal
          project={activeMilestonesProject}
          currentUser={currentUser}
          onClose={() => setMilestonesProjectId(null)}
          onOpenCheckout={(proj, milestone) => {
            setCheckoutPayload({
              project: proj,
              milestone,
              developerName: 'Chidinma Okafor',
              developerUid: proj.hiredDeveloperUid || 'user-dev-verified',
            });
          }}
          onOpenDisputeModal={(pId, mId, mTitle) => {
            setDisputePayload({ projectId: pId, milestoneId: mId, milestoneTitle: mTitle });
          }}
        />
      )}

      {/* Milestone Dispute Modal */}
      {disputePayload && (
        <DisputeModal
          projectId={disputePayload.projectId}
          milestoneId={disputePayload.milestoneId}
          milestoneTitle={disputePayload.milestoneTitle}
          currentUser={currentUser}
          project={activeDisputeProject}
          onClose={() => setDisputePayload(null)}
          onSuccess={() => {
            setDisputePayload(null);
          }}
        />
      )}

      {/* Legal & Trust Policy Modal */}
      {activeLegalDoc && (
        <LegalModal
          docType={activeLegalDoc}
          onClose={() => setActiveLegalDoc(null)}
        />
      )}

      {/* Payment Checkout & Escrow Funding Modal */}
      {checkoutPayload && (
        <PaymentCheckoutModal
          project={checkoutPayload.project}
          milestone={checkoutPayload.milestone}
          currentUser={currentUser}
          developerName={checkoutPayload.developerName}
          developerUid={checkoutPayload.developerUid}
          onSuccess={() => {
            // Milestone funded successfully
          }}
          onClose={() => setCheckoutPayload(null)}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenLegal={type => setActiveLegalDoc(type)}
      />
    </div>
  );
}
