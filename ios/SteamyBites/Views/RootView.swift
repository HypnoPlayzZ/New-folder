import SwiftUI

enum Tab: Int { case menu, cart, orders, account }

struct RootView: View {
    @EnvironmentObject var cart: CartStore
    @State private var selection: Tab = .menu

    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selection) {
                MenuView()
                    .tabItem { Label("Menu", systemImage: "fork.knife") }
                    .tag(Tab.menu)

                CartView()
                    .tabItem { Label("Cart", systemImage: "bag.fill") }
                    .badge(cart.count)
                    .tag(Tab.cart)

                OrdersView()
                    .tabItem { Label("Orders", systemImage: "shippingbox.fill") }
                    .tag(Tab.orders)

                ProfileView()
                    .tabItem { Label("Account", systemImage: "person.crop.circle.fill") }
                    .tag(Tab.account)
            }

            // Floating cart bar — only over the Menu tab, sitting above the tab bar.
            if selection == .menu {
                FloatingCartBar { withAnimation(.spring) { selection = .cart } }
                    .padding(.bottom, 56)
            }
        }
    }
}
