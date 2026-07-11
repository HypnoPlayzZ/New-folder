import SwiftUI

/// Swiggy-style floating cart bar: springs up above the tab bar whenever the
/// cart has items, gives a little bounce on each change, and routes to Cart.
struct FloatingCartBar: View {
    @EnvironmentObject var cart: CartStore
    var onTap: () -> Void
    @State private var bounce = false

    var body: some View {
        Group {
            if !cart.isEmpty {
                Button(action: onTap) {
                    HStack(spacing: 12) {
                        ZStack {
                            Image(systemName: "bag.fill")
                            Text("\(cart.count)")
                                .font(.system(size: 11, weight: .black))
                                .foregroundStyle(Theme.accent)
                                .frame(width: 17, height: 17)
                                .background(Circle().fill(.white))
                                .offset(x: 11, y: -11)
                        }
                        .font(.title3)

                        VStack(alignment: .leading, spacing: 1) {
                            Text("\(cart.count) item\(cart.count == 1 ? "" : "s")")
                                .font(.caption.weight(.bold))
                            Text(rupees(cart.total))
                                .font(.subheadline.weight(.heavy))
                        }
                        Spacer()
                        HStack(spacing: 6) {
                            Text("View Cart").font(.subheadline.weight(.heavy))
                            Image(systemName: "arrow.right")
                        }
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 18)
                    .padding(.vertical, 14)
                    .background(
                        LinearGradient(colors: [Theme.accent, Theme.accentDeep],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .shadow(color: Theme.accent.opacity(0.4), radius: 16, y: 8)
                }
                .buttonStyle(PressScaleStyle(scale: 0.97))
                .padding(.horizontal, 14)
                .scaleEffect(bounce ? 1.04 : 1)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.7), value: cart.isEmpty)
        .onChange(of: cart.count) { _, _ in
            withAnimation(.spring(response: 0.25, dampingFraction: 0.45)) { bounce = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { bounce = false }
            }
        }
    }
}
