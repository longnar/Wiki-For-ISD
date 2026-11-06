import GlossaryScreen from './GlossaryScreen';

export default function GlossaryBasicScreen({
  isAuthenticated = false,
  onBackHome,
  onNavigateToAdvanced,
}) {
  return (
    <GlossaryScreen
      level="basic"
      isAuthenticated={isAuthenticated}
      onBackHome={onBackHome}
      onSwitchPage={onNavigateToAdvanced}
    />
  );
}
