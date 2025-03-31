import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerificationSuccess: () => void;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  phone,
  onVerificationSuccess,
}: PhoneVerificationModalProps) {
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    const auth = getAuth();
    setLoading(true);
    try {
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phone,
        auth.app.recaptcha
      );
      setVerificationId(verificationId);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!verificationId || !otp) return;
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(getAuth(), credential);
      onVerificationSuccess();
      onClose();
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Phone Number</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Enter OTP sent to {phone}
            </p>
          </div>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={sendOTP} disabled={loading}>
              {loading ? "Sending..." : "Resend OTP"}
            </Button>
            <Button onClick={verifyOTP} disabled={!otp || loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
