import SwiftUI

/// "Warm Bamboo" — a light, appetizing identity for the mobile app:
/// cream canvas, espresso ink, ember-orange accent, steamed-green for success.
enum Theme {
    static let ink = Color(hex: 0xFBF6EE)        // warm cream canvas (app background)
    static let charcoal = Color(hex: 0xFFFFFF)   // nav / tab bars
    static let smoke = Color(hex: 0xFFFFFF)       // cards / fields
    static let line = Color.black.opacity(0.07)
    static let text = Color(hex: 0x221A12)        // espresso
    static let muted = Color(hex: 0x6B5E50)       // warm brown-gray
    static let faint = Color(hex: 0xA89C8C)
    static let accent = Color(hex: 0xE8612C)      // ember orange
    static let accentDeep = Color(hex: 0xC8480F)
    static let green = Color(hex: 0x2E7D52)       // steamed green (success)
    static let ember = Color(hex: 0xE8612C)
    static let onAccent = Color.white             // text/icons on the accent fill

    /// Back-compat aliases (older code referenced `neon`).
    static var neon: Color { accent }
    static var neonDeep: Color { accentDeep }

    static let display = Font.system(.largeTitle, design: .rounded).weight(.black)
}

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}

/// Glossy 3D ember CTA: gradient + top gloss + hairline rim, and on press it
/// tilts back, sinks, and its glow tightens — a tactile, physical button.
struct NeonButtonStyle: ButtonStyle {
    var enabled: Bool = true
    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed
        return configuration.label
            .font(.headline.weight(.bold))
            .foregroundStyle(Theme.onAccent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                ZStack {
                    LinearGradient(colors: [Theme.accent, Theme.accentDeep],
                                   startPoint: .top, endPoint: .bottom)
                    LinearGradient(colors: [.white.opacity(0.45), .clear],
                                   startPoint: .top, endPoint: .center)
                        .blendMode(.softLight)
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(.white.opacity(0.22), lineWidth: 1)
            )
            .shadow(color: Theme.accent.opacity(enabled ? 0.5 : 0),
                    radius: pressed ? 6 : 18, y: pressed ? 3 : 11)
            .rotation3DEffect(.degrees(pressed ? 7 : 0), axis: (x: 1, y: 0, z: 0), perspective: 0.6)
            .scaleEffect(pressed ? 0.97 : 1)
            .offset(y: pressed ? 2 : 0)
            .opacity(enabled ? 1 : 0.5)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: pressed)
    }
}

/// White card surface with a hairline border + soft warm shadow (light theme).
struct CardBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Theme.smoke)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Theme.line, lineWidth: 1)
            )
            .shadow(color: Color(hex: 0x4A3320).opacity(0.06), radius: 10, y: 4)
    }
}

extension View {
    func card() -> some View { modifier(CardBackground()) }
    func screenBackground() -> some View {
        background(Theme.ink.ignoresSafeArea())
    }
}

func rupees(_ value: Double) -> String {
    "₹\(Int(value.rounded()))"
}
