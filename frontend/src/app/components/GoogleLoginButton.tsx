import { useEffect, useRef } from "react";

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (err: any) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "mock-google-id",
          callback: (response: any) => {
            if (response && response.credential) {
              onSuccess(response.credential);
            } else if (onError) {
              onError(new Error("No credential returned from Google"));
            }
          },
        });

        google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
          width: 320, // Fits nicely in the auth forms
          text: "continue_with",
          shape: "pill",
        });
      }
    };

    let intervalId = setInterval(() => {
      if ((window as any).google) {
        initializeGoogleSignIn();
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [onSuccess, onError]);

  return (
    <div className="flex justify-center w-full">
      <div ref={divRef} />
    </div>
  );
}
