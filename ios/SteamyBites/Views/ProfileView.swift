import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var session: Session
    @State private var showSignIn = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.ink.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 18) {
                        avatar
                        if session.isSignedIn {
                            infoCard
                            Button("Sign out") { session.signOut() }
                                .buttonStyle(NeonButtonStyle())
                                .padding(.horizontal, 8)
                        } else {
                            Text("Sign in to order and track deliveries.")
                                .font(.footnote).foregroundStyle(Theme.muted)
                            Button("Sign in") { showSignIn = true }
                                .buttonStyle(NeonButtonStyle())
                                .padding(.horizontal, 8)
                        }
                        aboutCard
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Account")
            .sheet(isPresented: $showSignIn) { SignInView() }
        }
    }

    private var avatar: some View {
        VStack(spacing: 10) {
            ZStack {
                Circle().fill(Theme.smoke).frame(width: 84, height: 84)
                    .overlay(Circle().stroke(Theme.neon.opacity(0.5), lineWidth: 1.5))
                Text(initials).font(.title.weight(.black)).foregroundStyle(Theme.accent)
            }
            .floating(5)
            Text(session.userName ?? "Guest").font(.title3.weight(.bold)).foregroundStyle(Theme.text)
        }
        .padding(.top, 12)
    }

    private var infoCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Signed in", systemImage: "checkmark.shield.fill").foregroundStyle(Theme.neon)
            Text("Your orders, cart and account stay in sync with steamybites.com.")
                .font(.footnote).foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16).card()
    }

    private var aboutCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(Config.brand) · \(Config.supportCity)").font(.headline).foregroundStyle(Theme.text)
            Text("Bamboo-steamed momos, wok chowmein, wood-fire Italian & loaded burgers — delivered hot in 30 minutes.")
                .font(.footnote).foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16).card()
    }

    private var initials: String {
        let name = session.userName ?? "G"
        return String(name.prefix(1)).uppercased()
    }
}
