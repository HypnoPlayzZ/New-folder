import SwiftUI

struct OrdersView: View {
    @EnvironmentObject var session: Session
    @State private var orders: [Order] = []
    @State private var isLoading = false
    @State private var error: String?
    @State private var showSignIn = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.ink.ignoresSafeArea()
                if !session.isSignedIn {
                    VStack(spacing: 16) {
                        EmptyState(icon: "person.crop.circle.badge.questionmark",
                                   title: "Sign in to see orders",
                                   subtitle: "Track every order live, from wok to door.")
                        Button("Sign in") { showSignIn = true }
                            .buttonStyle(NeonButtonStyle())
                            .padding(.horizontal, 60)
                    }
                } else if isLoading {
                    ProgressView().tint(Theme.neon)
                } else if let error {
                    ErrorState(message: error) { Task { await load() } }
                } else if orders.isEmpty {
                    EmptyState(icon: "shippingbox", title: "No orders yet",
                               subtitle: "Your orders will show up here.")
                } else {
                    list
                }
            }
            .navigationTitle("Orders")
            .sheet(isPresented: $showSignIn) { SignInView() }
            .task(id: session.token) { if session.isSignedIn { await load() } }
            .refreshable { await load() }
        }
    }

    private var list: some View {
        ScrollView {
            VStack(spacing: 12) {
                ForEach(orders) { order in
                    NavigationLink {
                        OrderDetailView(order: order)
                    } label: {
                        OrderRow(order: order)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(16)
        }
    }

    private func load() async {
        isLoading = orders.isEmpty; error = nil
        do {
            orders = try await APIClient.shared.myOrders()
        } catch let APIError.http(code, msg) {
            if code == 401 { session.handleUnauthorized() } else { error = msg }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

struct OrderRow: View {
    let order: Order

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Order #\(order.shortId)")
                    .font(.subheadline.weight(.bold)).foregroundStyle(Theme.text)
                Text("\(order.items.count) item\(order.items.count == 1 ? "" : "s") · \(rupees(order.finalPrice))")
                    .font(.caption).foregroundStyle(Theme.muted)
            }
            Spacer()
            StatusPill(status: order.status)
        }
        .padding(14)
        .card()
    }
}

struct StatusPill: View {
    let status: String
    var body: some View {
        Text(status.uppercased())
            .font(.caption2.weight(.heavy))
            .foregroundStyle(color)
            .padding(.horizontal, 10).padding(.vertical, 5)
            .background(color.opacity(0.14))
            .clipShape(Capsule())
            .overlay(Capsule().stroke(color.opacity(0.4), lineWidth: 1))
    }
    private var color: Color {
        switch status {
        case "Delivered": return Theme.green
        case "Rejected": return Color(hex: 0xD23B2A)
        case "Out for Delivery", "Ready": return Theme.accent
        default: return Theme.muted
        }
    }
}
