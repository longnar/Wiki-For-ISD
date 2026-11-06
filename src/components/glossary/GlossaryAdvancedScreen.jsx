import GlossaryScreen from './GlossaryScreen';

export default function GlossaryAdvancedScreen({
  isAuthenticated = false,
  onBackHome,
  onNavigateToBasic,
}) {
  return (
    <GlossaryScreen
      level="advanced"
      isAuthenticated={isAuthenticated}
      onBackHome={onBackHome}
      onSwitchPage={onNavigateToBasic}
    />
  );
}
