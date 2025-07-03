import AuthRedirectWrapper from "./components/AuthRedirectWrapper";
import LandingPage from "./components/LandingPage";

export default function Page() {
  return (
    <AuthRedirectWrapper>
      <LandingPage />
    </AuthRedirectWrapper>
  );
}
