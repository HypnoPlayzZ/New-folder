import SwiftUI

struct MenuView: View {
    @EnvironmentObject var cart: CartStore
    @State private var categories: [MenuCategory] = []
    @State private var isLoading = true
    @State private var error: String?
    @State private var selectedCat = "All"
    @State private var search = ""

    private var visibleCategories: [MenuCategory] {
        let base = selectedCat == "All" ? categories : categories.filter { $0.name == selectedCat }
        guard !search.isEmpty else { return base }
        let q = search.lowercased()
        return base.compactMap { cat in
            let items = cat.items.filter { $0.name.lowercased().contains(q) }
            return items.isEmpty ? nil : MenuCategory(name: cat.name, items: items)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.ink.ignoresSafeArea()
                content
            }
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { await load() }
    }

    @ViewBuilder private var content: some View {
        if isLoading {
            ScrollView { SkeletonMenu() }
        } else if let error {
            ErrorState(message: error) { Task { await load() } }
        } else {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 20, pinnedViews: [.sectionHeaders]) {
                    locationBar
                    searchField
                    PromoBanner()
                    if search.isEmpty { categoryRail }

                    Section {
                        ForEach(visibleCategories) { cat in
                            sectionTitle(cat.name, count: cat.items.count)
                            ForEach(cat.items) { item in
                                DishCard(item: item)
                                    .scrollReveal3D()
                                    .transition(.asymmetric(
                                        insertion: .scale(scale: 0.94).combined(with: .opacity),
                                        removal: .opacity))
                            }
                        }
                        if visibleCategories.isEmpty {
                            EmptyState(icon: "magnifyingglass", title: "Nothing found",
                                       subtitle: "Try a different dish or category.")
                                .frame(maxWidth: .infinity).padding(.top, 40)
                        }
                    } header: {
                        chipBar
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 130)
                .animation(.spring(response: 0.4, dampingFraction: 0.85), value: selectedCat)
                .animation(.easeOut(duration: 0.2), value: search)
            }
        }
    }

    // MARK: header pieces

    private var locationBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "location.fill").foregroundStyle(Theme.accent)
            VStack(alignment: .leading, spacing: 1) {
                Text("DELIVER TO").font(.system(size: 10, weight: .heavy)).foregroundStyle(Theme.accent)
                Text("\(Config.supportCity) · 30 min").font(.subheadline.weight(.bold)).foregroundStyle(Theme.text)
            }
            Spacer()
            Circle().fill(Theme.smoke).frame(width: 38, height: 38)
                .overlay(Image(systemName: "person.fill").foregroundStyle(Theme.muted))
                .overlay(Circle().stroke(Theme.line, lineWidth: 1))
        }
        .padding(.top, 12)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass").foregroundStyle(Theme.accent)
            TextField("", text: $search,
                      prompt: Text("Search momos, chowmein, burgers…").foregroundColor(Theme.faint))
                .foregroundStyle(Theme.text)
            if !search.isEmpty {
                Button { search = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Theme.faint) }
            }
        }
        .padding(.horizontal, 14).padding(.vertical, 13)
        .background(Theme.smoke)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.line, lineWidth: 1))
        .shadow(color: Color(hex: 0x4A3320).opacity(0.05), radius: 8, y: 3)
    }

    private var categoryRail: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("WHAT’S ON YOUR MIND?").font(.caption.weight(.heavy)).foregroundStyle(Theme.muted).tracking(1)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(categories) { cat in
                        CategoryBubble(category: cat, selected: selectedCat == cat.name) {
                            Haptics.tap()
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                                selectedCat = selectedCat == cat.name ? "All" : cat.name
                            }
                        }
                        .coverFlow3D(angle: 28)
                    }
                }
                .padding(.vertical, 2)
            }
        }
    }

    private func sectionTitle(_ name: String, count: Int) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(name).font(.title3.weight(.black)).foregroundStyle(Theme.text)
            Text("\(count)").font(.subheadline.weight(.bold)).foregroundStyle(Theme.faint)
            Spacer()
        }
        .padding(.top, 6)
    }

    private var chipBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                chip("All")
                ForEach(categories) { chip($0.name) }
            }
            .padding(.vertical, 10)
        }
        .background(Theme.ink)
    }

    private func chip(_ name: String) -> some View {
        let active = selectedCat == name
        return Button {
            Haptics.tap()
            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) { selectedCat = name }
        } label: {
            Text(name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(active ? Theme.onAccent : Theme.text)
                .padding(.horizontal, 16).padding(.vertical, 9)
                .background(Capsule().fill(active ? Theme.accent : Theme.smoke))
                .overlay(Capsule().stroke(Theme.line, lineWidth: active ? 0 : 1))
                .shadow(color: active ? Theme.accent.opacity(0.3) : .clear, radius: 8, y: 3)
        }
        .buttonStyle(PressScaleStyle())
    }

    private func load() async {
        if categories.isEmpty { isLoading = true }
        error = nil
        do { categories = try await APIClient.shared.fetchMenu() }
        catch { self.error = error.localizedDescription }
        isLoading = false
    }
}

// MARK: - Promo banner carousel

struct PromoBanner: View {
    private let promos: [(String, String, String, [Color])] = [
        ("50% OFF up to ₹100", "USE CODE  ·  FIRST50", "tag.fill", [Color(hex: 0xE8612C), Color(hex: 0xC8480F)]),
        ("Free delivery", "On orders over ₹250", "bicycle", [Color(hex: 0x2E7D52), Color(hex: 0x1C5E3C)]),
        ("Bamboo-steamed daily", "Fresh momos in 30 min", "takeoutbag.and.cup.and.straw.fill", [Color(hex: 0x8A4B12), Color(hex: 0x5E3008)]),
    ]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 14) {
                ForEach(Array(promos.enumerated()), id: \.offset) { _, p in
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(p.0).font(.title2.weight(.black)).foregroundStyle(.white)
                            Text(p.1).font(.subheadline.weight(.bold)).foregroundStyle(.white.opacity(0.92))
                        }
                        Spacer()
                        Image(systemName: p.2).font(.system(size: 44)).foregroundStyle(.white.opacity(0.85))
                    }
                    .padding(22)
                    .frame(height: 128)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        ZStack {
                            LinearGradient(colors: p.3, startPoint: .topLeading, endPoint: .bottomTrailing)
                            LinearGradient(colors: [.white.opacity(0.25), .clear], startPoint: .top, endPoint: .center)
                                .blendMode(.softLight)
                        }
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .shadow(color: p.3[1].opacity(0.4), radius: 14, y: 8)
                    .containerRelativeFrame(.horizontal)
                    .coverFlow3D(angle: 22)
                }
            }
            .scrollTargetLayout()
        }
        .scrollTargetBehavior(.paging)
        .frame(height: 128)
    }
}

// MARK: - Round category bubble

struct CategoryBubble: View {
    let category: MenuCategory
    let selected: Bool
    let action: () -> Void

    private var image: URL? { category.items.first(where: { $0.imageURL != nil })?.imageURL }

    var body: some View {
        Button(action: action) {
            VStack(spacing: 7) {
                ZStack {
                    Circle().fill(Theme.smoke)
                    AsyncImage(url: image) { phase in
                        if case .success(let img) = phase { img.resizable().scaledToFill() }
                        else { Image(systemName: "fork.knife").foregroundStyle(Theme.faint) }
                    }
                    .frame(width: 66, height: 66).clipShape(Circle())
                }
                .frame(width: 70, height: 70)
                .overlay(Circle().stroke(selected ? Theme.accent : Theme.line, lineWidth: selected ? 2.5 : 1))
                .shadow(color: selected ? Theme.accent.opacity(0.3) : .black.opacity(0.05), radius: 6, y: 3)

                Text(category.name)
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(selected ? Theme.accent : Theme.muted)
                    .lineLimit(1).frame(width: 72)
            }
        }
        .buttonStyle(PressScaleStyle())
    }
}

// MARK: - Big photo-forward dish card

struct DishCard: View {
    let item: MenuItem
    @EnvironmentObject var cart: CartStore
    @State private var showSizeDialog = false
    @State private var pop = false

    private var qty: Int { cart.qty(for: item) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                AsyncImage(url: item.imageURL) { phase in
                    switch phase {
                    case .success(let img): img.resizable().scaledToFill()
                    case .empty: ShimmerBlock(height: 172, corner: 0)
                    default: ZStack { Theme.smoke; Image(systemName: "fork.knife").font(.title).foregroundStyle(Theme.faint) }
                    }
                }
                .frame(height: 172).frame(maxWidth: .infinity).clipped()

                LinearGradient(colors: [.black.opacity(0.0), .black.opacity(0.0), .black.opacity(0.35)],
                               startPoint: .top, endPoint: .bottom)

                HStack(spacing: 6) {
                    VegDot(isVeg: isVeg(item.name))
                    if item.hasHalf {
                        Text("HALF / FULL").font(.system(size: 9, weight: .heavy)).foregroundStyle(.white)
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(.black.opacity(0.45)).clipShape(Capsule())
                    }
                }
                .padding(10)
            }
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(alignment: .bottomTrailing) { addControl.padding(12).offset(y: 18) }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name).font(.headline).foregroundStyle(Theme.text).lineLimit(1)
                if !item.description.isEmpty {
                    Text(item.description).font(.caption).foregroundStyle(Theme.muted).lineLimit(2)
                }
                HStack(spacing: 8) {
                    Text(rupees(item.price.full)).font(.subheadline.weight(.heavy)).foregroundStyle(Theme.text)
                    if let half = item.price.half {
                        Text("half \(rupees(half))").font(.caption2).foregroundStyle(Theme.faint)
                    }
                }
                .padding(.top, 2)
            }
            .padding(14)
            .padding(.trailing, 60)
        }
        .card()
    }

    @ViewBuilder private var addControl: some View {
        if qty == 0 {
            Button {
                Haptics.tap()
                if item.hasHalf { showSizeDialog = true }
                else { withAnimation(.spring(response: 0.3, dampingFraction: 0.55)) { cart.add(item, variant: .full) } }
            } label: {
                Text("ADD")
                    .font(.subheadline.weight(.heavy)).foregroundStyle(Theme.accent)
                    .padding(.horizontal, 26).padding(.vertical, 11)
                    .background(Color.white)
                    .overlay(Capsule().stroke(Theme.accent.opacity(0.5), lineWidth: 1.5))
                    .clipShape(Capsule())
                    .shadow(color: .black.opacity(0.12), radius: 8, y: 3)
            }
            .buttonStyle(PressScaleStyle(scale: 0.9))
            .transition(.scale.combined(with: .opacity))
            .confirmationDialog("Choose size", isPresented: $showSizeDialog, titleVisibility: .visible) { sizeButtons }
        } else {
            HStack(spacing: 16) {
                stepButton("minus") { Haptics.soft(); withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { cart.decrementItem(item) } }
                Text("\(qty)").font(.subheadline.weight(.black)).foregroundStyle(.white).frame(minWidth: 16)
                    .contentTransition(.numericText())
                stepButton("plus") {
                    Haptics.tap()
                    if item.hasHalf { showSizeDialog = true }
                    else { withAnimation(.spring(response: 0.3, dampingFraction: 0.55)) { cart.add(item, variant: .full) } }
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 11)
            .background(LinearGradient(colors: [Theme.accent, Theme.accentDeep], startPoint: .top, endPoint: .bottom))
            .clipShape(Capsule())
            .shadow(color: Theme.accent.opacity(0.4), radius: 8, y: 3)
            .scaleEffect(pop ? 1.08 : 1)
            .transition(.scale.combined(with: .opacity))
            .confirmationDialog("Choose size", isPresented: $showSizeDialog, titleVisibility: .visible) { sizeButtons }
            .onChange(of: qty) { _, _ in
                withAnimation(.spring(response: 0.2, dampingFraction: 0.4)) { pop = true }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.14) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { pop = false }
                }
            }
        }
    }

    @ViewBuilder private var sizeButtons: some View {
        if let half = item.price.half {
            Button("Half · \(rupees(half))") { Haptics.tap(); withAnimation(.spring) { cart.add(item, variant: .half) } }
        }
        Button("Full · \(rupees(item.price.full))") { Haptics.tap(); withAnimation(.spring) { cart.add(item, variant: .full) } }
    }

    private func stepButton(_ icon: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) { Image(systemName: icon).font(.caption.weight(.black)).foregroundStyle(.white) }
            .buttonStyle(PressScaleStyle(scale: 0.8))
    }

    private func isVeg(_ name: String) -> Bool {
        let n = name.lowercased()
        return !["chicken", "egg", "mutton", "fish", "prawn", "keema", "lamb"].contains { n.contains($0) }
    }
}

/// Veg / non-veg square indicator on a white chip (readable over photos).
struct VegDot: View {
    let isVeg: Bool
    var body: some View {
        let c = isVeg ? Theme.green : Color(hex: 0xD23B2A)
        RoundedRectangle(cornerRadius: 3).stroke(c, lineWidth: 1.5)
            .frame(width: 16, height: 16)
            .overlay(Circle().fill(c).frame(width: 7, height: 7))
            .padding(3)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 5))
    }
}
