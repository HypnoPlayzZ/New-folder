import SwiftUI

struct CartView: View {
    @EnvironmentObject var cart: CartStore
    @EnvironmentObject var session: Session
    @State private var goCheckout = false
    @State private var showSignIn = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.ink.ignoresSafeArea()
                if cart.isEmpty {
                    EmptyState(icon: "bag", title: "Your bag is empty",
                               subtitle: "Add something steamy from the menu.")
                } else {
                    cartContent
                }
            }
            .navigationTitle("Your Bag")
            .navigationDestination(isPresented: $goCheckout) { CheckoutView() }
            .sheet(isPresented: $showSignIn) { SignInView() }
        }
    }

    private var cartContent: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(cart.lines) { line in
                        CartRow(line: line)
                            .transition(.move(edge: .leading).combined(with: .opacity))
                    }
                }
                .padding(16)
                .animation(.spring(response: 0.4, dampingFraction: 0.8), value: cart.lines)
            }
            summary
        }
    }

    private var summary: some View {
        VStack(spacing: 12) {
            row("Subtotal", rupees(cart.subtotal))
            row("Delivery", cart.deliveryFee == 0 ? "FREE" : rupees(cart.deliveryFee))
            Divider().overlay(Theme.line)
            row("Total", rupees(cart.total), bold: true)

            Button {
                if session.isSignedIn { goCheckout = true } else { showSignIn = true }
            } label: {
                Text(session.isSignedIn ? "Checkout · \(rupees(cart.total))" : "Sign in to checkout")
            }
            .buttonStyle(NeonButtonStyle())
        }
        .padding(16)
        .background(Theme.charcoal.ignoresSafeArea(edges: .bottom))
        .overlay(Rectangle().frame(height: 1).foregroundStyle(Theme.line), alignment: .top)
    }

    private func row(_ label: String, _ value: String, bold: Bool = false) -> some View {
        HStack {
            Text(label).foregroundStyle(bold ? Theme.text : Theme.muted)
            Spacer()
            Text(value)
                .foregroundStyle(bold ? Theme.neon : Theme.text)
                .font(bold ? .title3.weight(.black) : .body.weight(.semibold))
        }
    }
}

struct CartRow: View {
    let line: CartLine
    @EnvironmentObject var cart: CartStore

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(line.item.name).font(.subheadline.weight(.bold)).foregroundStyle(Theme.text)
                Text(line.variant.label).font(.caption).foregroundStyle(Theme.muted)
                Text(rupees(line.unitPrice)).font(.caption.weight(.semibold)).foregroundStyle(Theme.neon)
            }
            Spacer()
            stepper
        }
        .padding(12)
        .card()
    }

    private var stepper: some View {
        HStack(spacing: 14) {
            Button { cart.decrement(line) } label: { Image(systemName: "minus") }
            Text("\(line.qty)").font(.subheadline.weight(.bold)).foregroundStyle(Theme.text).frame(minWidth: 18)
            Button { cart.increment(line) } label: { Image(systemName: "plus") }
        }
        .foregroundStyle(Theme.neon)
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(Theme.charcoal)
        .clipShape(Capsule())
        .overlay(Capsule().stroke(Theme.line, lineWidth: 1))
    }
}
