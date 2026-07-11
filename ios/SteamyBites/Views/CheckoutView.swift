import SwiftUI

struct CheckoutView: View {
    @EnvironmentObject var cart: CartStore
    @EnvironmentObject var session: Session

    @State private var name = ""
    @State private var mobile = ""
    @State private var address = ""
    @State private var placing = false
    @State private var error: String?
    @State private var placedOrder: Order?

    private var canPlace: Bool {
        !placing && !address.trimmingCharacters(in: .whitespaces).isEmpty
            && mobile.count == 10 && !cart.isEmpty
    }

    var body: some View {
        ZStack {
            Theme.ink.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Delivery details").font(.title2.weight(.bold)).foregroundStyle(Theme.text)

                    ThemedField(placeholder: "Full name", text: $name)
                    ThemedField(placeholder: "10-digit mobile", text: $mobile, keyboard: .numberPad)
                    ThemedField(placeholder: "Delivery address", text: $address)

                    orderSummary

                    if let error {
                        Text(error).font(.footnote).foregroundStyle(Theme.ember)
                    }

                    Button {
                        Task { await place() }
                    } label: {
                        if placing { ProgressView().tint(.white) }
                        else { Text("Place order · \(rupees(cart.total)) · COD") }
                    }
                    .buttonStyle(NeonButtonStyle(enabled: canPlace))
                    .disabled(!canPlace)

                    Text("Cash on delivery. Online payment (UPI/Razorpay) is coming next.")
                        .font(.caption2).foregroundStyle(Theme.faint)
                }
                .padding(16)
            }
        }
        .navigationTitle("Checkout")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { if name.isEmpty { name = session.userName ?? "" } }
        .navigationDestination(item: $placedOrder) { order in
            OrderDetailView(order: order, justPlaced: true)
        }
    }

    private var orderSummary: some View {
        VStack(spacing: 10) {
            ForEach(cart.lines) { line in
                HStack {
                    Text("\(line.qty)× \(line.item.name) (\(line.variant.label))")
                        .font(.footnote).foregroundStyle(Theme.muted).lineLimit(1)
                    Spacer()
                    Text(rupees(line.lineTotal)).font(.footnote.weight(.semibold)).foregroundStyle(Theme.text)
                }
            }
            Divider().overlay(Theme.line)
            HStack {
                Text("Total").foregroundStyle(Theme.text).font(.headline)
                Spacer()
                Text(rupees(cart.total)).foregroundStyle(Theme.neon).font(.headline.weight(.black))
            }
        }
        .padding(14)
        .card()
    }

    private func place() async {
        error = nil; placing = true
        let req = CreateOrderRequest(
            items: cart.orderItems(),
            customerName: name.isEmpty ? "Customer" : name,
            mobile: mobile,
            address: address,
            paymentMethod: "COD",
            locationCoords: nil,
            locationLink: nil
        )
        do {
            let order = try await APIClient.shared.createOrder(req)
            cart.clear()
            placedOrder = order
        } catch let APIError.http(code, msg) {
            if code == 401 { session.handleUnauthorized(); error = "Please sign in again." }
            else { error = msg }
        } catch {
            self.error = error.localizedDescription
        }
        placing = false
    }
}
