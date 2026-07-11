import Foundation
import SwiftUI

struct CartLine: Identifiable, Hashable {
    let item: MenuItem
    let variant: Variant
    var qty: Int
    var id: String { "\(item.id)-\(variant.rawValue)" }
    var unitPrice: Double { item.price(for: variant) ?? item.price.full }
    var lineTotal: Double { unitPrice * Double(qty) }
}

@MainActor
final class CartStore: ObservableObject {
    @Published private(set) var lines: [CartLine] = []

    var count: Int { lines.reduce(0) { $0 + $1.qty } }
    var subtotal: Double { lines.reduce(0) { $0 + $1.lineTotal } }
    var isEmpty: Bool { lines.isEmpty }

    /// Free delivery over ₹250, else ₹30 (mirrors the website's promo copy).
    var deliveryFee: Double { subtotal >= 250 || subtotal == 0 ? 0 : 30 }
    var total: Double { subtotal + deliveryFee }

    func add(_ item: MenuItem, variant: Variant) {
        if let idx = lines.firstIndex(where: { $0.item.id == item.id && $0.variant == variant }) {
            lines[idx].qty += 1
        } else {
            lines.append(CartLine(item: item, variant: variant, qty: 1))
        }
    }

    func increment(_ line: CartLine) {
        guard let idx = lines.firstIndex(where: { $0.id == line.id }) else { return }
        lines[idx].qty += 1
    }

    func decrement(_ line: CartLine) {
        guard let idx = lines.firstIndex(where: { $0.id == line.id }) else { return }
        lines[idx].qty -= 1
        if lines[idx].qty <= 0 { lines.remove(at: idx) }
    }

    func remove(_ line: CartLine) {
        lines.removeAll { $0.id == line.id }
    }

    func clear() { lines.removeAll() }

    func qty(for item: MenuItem) -> Int {
        lines.filter { $0.item.id == item.id }.reduce(0) { $0 + $1.qty }
    }

    /// Remove one unit of an item from whichever of its lines has the most qty
    /// (used by the inline card stepper for items that may have half/full lines).
    func decrementItem(_ item: MenuItem) {
        guard let idx = lines.enumerated()
            .filter({ $0.element.item.id == item.id })
            .max(by: { $0.element.qty < $1.element.qty })?.offset else { return }
        lines[idx].qty -= 1
        if lines[idx].qty <= 0 { lines.remove(at: idx) }
    }

    /// Build the order payload the backend expects.
    func orderItems() -> [OrderItemRequest] {
        lines.map {
            OrderItemRequest(
                menuItemId: $0.item.id,
                itemName: $0.item.name,
                quantity: $0.qty,
                variant: $0.variant.rawValue,
                priceAtOrder: $0.unitPrice,
                instructions: ""
            )
        }
    }
}
