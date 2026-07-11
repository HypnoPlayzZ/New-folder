import SwiftUI

struct OrderDetailView: View {
    let order: Order
    var justPlaced: Bool = false

    @EnvironmentObject var session: Session
    @State private var status: String

    init(order: Order, justPlaced: Bool = false) {
        self.order = order
        self.justPlaced = justPlaced
        _status = State(initialValue: order.status)
    }

    var body: some View {
        ZStack {
            Theme.ink.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    if justPlaced { placedBanner }
                    headerCard
                    tracker
                    itemsCard
                    addressCard
                }
                .padding(16)
            }
        }
        .navigationTitle("Order #\(order.shortId)")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: session.token) { await trackLive() }
    }

    private var placedBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.seal.fill").foregroundStyle(Theme.neon)
            Text("Order placed! We’ll have it to you in ~30 minutes.")
                .font(.subheadline.weight(.semibold)).foregroundStyle(Theme.text)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.neon.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var headerCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Total paid / due").font(.caption).foregroundStyle(Theme.muted)
                Text(rupees(order.finalPrice)).font(.title.weight(.black)).foregroundStyle(Theme.neon)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(order.paymentMethod).font(.caption.weight(.bold)).foregroundStyle(Theme.text)
                StatusPill(status: status)
            }
        }
        .padding(16)
        .card()
    }

    private var tracker: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("LIVE STATUS").font(.caption.weight(.heavy)).foregroundStyle(Theme.neon).tracking(2)
                .padding(.bottom, 14)
            ForEach(Array(Order.pipeline.enumerated()), id: \.offset) { idx, step in
                stageRow(idx: idx, step: step, isLast: idx == Order.pipeline.count - 1)
            }
            if status == "Rejected" {
                Text("This order was rejected. Please contact support.")
                    .font(.footnote).foregroundStyle(Theme.ember).padding(.top, 8)
            }
        }
        .padding(16)
        .card()
    }

    private func stageRow(idx: Int, step: String, isLast: Bool) -> some View {
        let current = Order.pipeline.firstIndex(of: status) ?? 0
        let done = idx <= current
        let active = idx == current && status != "Delivered"
        return HStack(alignment: .top, spacing: 14) {
            VStack(spacing: 0) {
                StageNode(done: done, active: active)
                if !isLast {
                    Rectangle().fill(idx < current ? Theme.accent : Theme.line)
                        .frame(width: 2, height: 30)
                        .animation(.easeInOut(duration: 0.5), value: current)
                }
            }
            Text(step)
                .font(.subheadline.weight(active ? .bold : .regular))
                .foregroundStyle(done ? Theme.text : Theme.faint)
                .padding(.top, 1)
            Spacer()
            if active {
                Text("NOW").font(.caption2.weight(.heavy)).foregroundStyle(Theme.accent)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Theme.accent.opacity(0.12)).clipShape(Capsule())
            }
        }
    }

    private var itemsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Items").font(.headline).foregroundStyle(Theme.text)
            ForEach(Array(order.items.enumerated()), id: \.offset) { _, it in
                HStack {
                    Text("\(it.quantity)× \(it.itemName ?? "Item") (\(it.variant))")
                        .font(.footnote).foregroundStyle(Theme.muted)
                    Spacer()
                    Text(rupees(it.priceAtOrder * Double(it.quantity)))
                        .font(.footnote.weight(.semibold)).foregroundStyle(Theme.text)
                }
            }
        }
        .padding(16)
        .card()
    }

    private var addressCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Delivering to").font(.headline).foregroundStyle(Theme.text)
            Text(order.customerName).font(.subheadline).foregroundStyle(Theme.text)
            if !order.mobile.isEmpty { Text(order.mobile).font(.footnote).foregroundStyle(Theme.muted) }
            Text(order.address).font(.footnote).foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .card()
    }

    /// A tracker node: filled + checkmark when done, pulsing ring when active.
    private struct StageNode: View {
        let done: Bool
        let active: Bool
        @State private var pulse = false
        var body: some View {
            ZStack {
                if active {
                    Circle().stroke(Theme.accent.opacity(0.5), lineWidth: 2)
                        .frame(width: 30, height: 30)
                        .scaleEffect(pulse ? 1.3 : 1)
                        .opacity(pulse ? 0 : 0.9)
                }
                Circle().fill(done ? Theme.accent : Theme.smoke).frame(width: 22, height: 22)
                    .overlay(Circle().stroke(done ? Theme.accent : Theme.line, lineWidth: 1))
                if done {
                    Image(systemName: "checkmark").font(.caption2.weight(.black)).foregroundStyle(Theme.onAccent)
                } else if active {
                    Circle().fill(Theme.accent).frame(width: 8, height: 8)
                }
            }
            .onAppear {
                if active { withAnimation(.easeOut(duration: 1.1).repeatForever(autoreverses: false)) { pulse = true } }
            }
        }
    }

    /// Subscribe to the same realtime SSE feed the website uses.
    private func trackLive() async {
        guard let token = session.token, !order.isTerminal else { return }
        let stream = OrderStatusStream(orderId: order.id, token: token)
        do {
            for try await s in stream.statuses() {
                withAnimation(.snappy) { status = s }
                if s == "Delivered" || s == "Rejected" { break }
            }
        } catch {
            // Stream dropped (cold start / network) — the last known status stays.
        }
    }
}
