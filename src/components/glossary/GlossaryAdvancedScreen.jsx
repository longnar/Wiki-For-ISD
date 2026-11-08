import GlossaryScreen from './GlossaryScreen';

export default function GlossaryAdvancedScreen({
  isAuthenticated = false,
  initialTermId = null,
  onBackHome,
  onNavigateToBasic,
}) {
  return (
    <GlossaryScreen
      level="advanced"
      isAuthenticated={isAuthenticated}
      initialTermId={initialTermId}
      onBackHome={onBackHome}
      onSwitchPage={onNavigateToBasic}
    />
  );
}
