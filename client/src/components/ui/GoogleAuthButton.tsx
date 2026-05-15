import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleAuth } from '@/hooks/useAuth';

interface Props {
  onSuccess: (user: { isGuru: boolean }) => void;
}

export function GoogleAuthButton({ onSuccess }: Props) {
  const googleAuth = useGoogleAuth();

  const handleCredential = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    googleAuth.mutate(
      { idToken: credentialResponse.credential },
      { onSuccess: (data) => onSuccess(data.user) },
    );
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleCredential}
        onError={() => {}}
        width="400"
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
      {googleAuth.error && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {(googleAuth.error as { response?: { data?: { error?: { message?: string } } } })
            .response?.data?.error?.message ?? 'Google sign-in failed'}
        </p>
      )}
    </div>
  );
}
