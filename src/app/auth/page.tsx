import AuthRedirectWrapper from "@/app/components/AuthRedirectWrapper";
import AuthButton from "./components/Auth-Button";

function page() {
  return (
    <AuthRedirectWrapper>
      <AuthButton />
    </AuthRedirectWrapper>
  );
}

export default page;
