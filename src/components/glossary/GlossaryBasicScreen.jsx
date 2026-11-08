import GlossaryScreen from './GlossaryScreen';

export default function GlossaryBasicScreen({
  isAuthenticated = false,
  initialTermId = null,
  onBackHome,
  onNavigateToAdvanced,
}) {
  return (
    <GlossaryScreen
      level="basic"
      isAuthenticated={isAuthenticated}
      initialTermId={initialTermId}
      onBackHome={onBackHome}
      onSwitchPage={onNavigateToAdvanced}
    />
  );
}
