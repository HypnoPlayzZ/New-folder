import SwiftUI

struct SignInView: View {
    @EnvironmentObject var session: Session
    @Environment(\.dismiss) private var dismiss
    @State private var mobile = ""
    @State private var code = ""
    @State private var showPhone = false
    @State private var busyGoogle = false

    private var otpStage: Bool { session.phase == .otpSent || session.phase == .verifying }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.ink.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        header

                        // Primary: Google
                        Button {
                            Task { await signInGoogle() }
                        } label: {
                            HStack(spacing: 10) {
                                if busyGoogle { ProgressView().tint(.white) }
                                else { Image(systemName: "g.circle.fill") }
                                Text(busyGoogle ? "Signing in…" : "Continue with Google")
                            }
                        }
                        .buttonStyle(NeonButtonStyle(enabled: !busyGoogle))
                        .disabled(busyGoogle)

                        orDivider

                        // Secondary: phone
                        if !showPhone && !otpStage {
                            Button {
                                withAnimation(.spring) { showPhone = true }
                            } label: {
                                HStack { Image(systemName: "phone.fill"); Text("Use phone number") }
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(Theme.text)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Theme.smoke)
                                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.line, lineWidth: 1))
                            }
                            .buttonStyle(PressScaleStyle())
                        } else {
                            phoneBlock
                        }

                        if let err = session.errorMessage {
                            Text(err).font(.footnote).foregroundStyle(Color(hex: 0xD23B2A))
                        }
                    }
                    .padding(20)
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }.foregroundStyle(Theme.muted)
                }
            }
            .onChange(of: session.phase) { _, newValue in
                if newValue == .signedIn { dismiss() }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Sign in").font(.system(size: 34, weight: .black, design: .rounded)).foregroundStyle(Theme.text)
            Text("Order in 30 minutes and track every bite, live.")
                .font(.footnote).foregroundStyle(Theme.muted)
        }
    }

    private var orDivider: some View {
        HStack {
            Rectangle().fill(Theme.line).frame(height: 1)
            Text("OR").font(.caption.weight(.bold)).foregroundStyle(Theme.faint)
            Rectangle().fill(Theme.line).frame(height: 1)
        }
    }

    @ViewBuilder private var phoneBlock: some View {
        if !otpStage {
            ThemedField(placeholder: "10-digit mobile", text: $mobile, keyboard: .numberPad)
            Button {
                Task { await session.sendOTP(mobile: mobile) }
            } label: {
                if session.phase == .sendingOTP { ProgressView().tint(.white) } else { Text("Send code") }
            }
            .buttonStyle(NeonButtonStyle(enabled: mobile.count == 10))
            .disabled(mobile.count != 10)
        } else {
            Text("Code sent to \(mobile)").font(.footnote).foregroundStyle(Theme.muted)
            ThemedField(placeholder: "6-digit code", text: $code, keyboard: .numberPad)
            Button {
                Task { await session.verifyOTP(mobile: mobile, code: code) }
            } label: {
                if session.phase == .verifying { ProgressView().tint(.white) } else { Text("Verify & sign in") }
            }
            .buttonStyle(NeonButtonStyle(enabled: code.count >= 4))
            .disabled(code.count < 4)
            Button("Use a different number") { code = ""; session.phase = .idle }
                .font(.footnote).foregroundStyle(Theme.muted)
        }
    }

    private func signInGoogle() async {
        session.errorMessage = nil
        busyGoogle = true
        do {
            let idToken = try await GoogleAuth.shared.signIn()
            await session.signInWithGoogle(idToken: idToken)
        } catch {
            session.errorMessage = error.localizedDescription
        }
        busyGoogle = false
    }
}
