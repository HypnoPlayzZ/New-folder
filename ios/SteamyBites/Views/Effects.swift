import SwiftUI
import UIKit

// MARK: - Haptics

enum Haptics {
    static func tap() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    static func soft() { UIImpactFeedbackGenerator(style: .soft).impactOccurred() }
    static func rigid() { UIImpactFeedbackGenerator(style: .rigid).impactOccurred() }
    static func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
}

// MARK: - Press scale (tactile buttons / cards)

struct PressScaleStyle: ButtonStyle {
    var scale: CGFloat = 0.96
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

// MARK: - 3D scroll-driven motion (iOS 17 scrollTransition)

extension View {
    /// Cards tilt back, scale up and fade in 3D as they scroll into view.
    func scrollReveal3D() -> some View {
        scrollTransition(.interactive, axis: .vertical) { content, phase in
            content
                .opacity(phase.isIdentity ? 1 : 0.2)
                .scaleEffect(phase.isIdentity ? 1 : 0.88)
                .rotation3DEffect(.degrees(phase.value * 9), axis: (x: 1, y: 0, z: 0), perspective: 0.5)
                .offset(y: phase.value * 18)
        }
    }

    /// Horizontal cover-flow: items rotate in 3D around the Y axis off-center.
    func coverFlow3D(angle: Double = 34) -> some View {
        scrollTransition(.interactive, axis: .horizontal) { content, phase in
            content
                .rotation3DEffect(.degrees(phase.value * angle), axis: (x: 0, y: 1, z: 0), perspective: 0.6)
                .scaleEffect(phase.isIdentity ? 1 : 0.86)
                .opacity(phase.isIdentity ? 1 : 0.65)
        }
    }
}

/// Gentle continuous float (for hero icons / avatars).
struct FloatingEffect: ViewModifier {
    @State private var up = false
    var distance: CGFloat = 7
    func body(content: Content) -> some View {
        content
            .offset(y: up ? -distance : distance)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true)) { up = true }
            }
    }
}

extension View {
    func floating(_ distance: CGFloat = 7) -> some View { modifier(FloatingEffect(distance: distance)) }
}

// MARK: - Shimmer skeletons

struct ShimmerBlock: View {
    var width: CGFloat? = nil
    var height: CGFloat
    var corner: CGFloat = 8
    @State private var x: CGFloat = -1.2

    var body: some View {
        RoundedRectangle(cornerRadius: corner, style: .continuous)
            .fill(Color.black.opacity(0.06))
            .frame(width: width, height: height)
            .overlay(
                GeometryReader { geo in
                    LinearGradient(
                        colors: [.clear, Color.white.opacity(0.7), .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.7)
                    .offset(x: x * geo.size.width)
                }
                .clipShape(RoundedRectangle(cornerRadius: corner, style: .continuous))
            )
            .onAppear {
                withAnimation(.linear(duration: 1.1).repeatForever(autoreverses: false)) { x = 1.4 }
            }
    }
}

/// Skeleton placeholder list shown while the menu loads.
struct SkeletonMenu: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            VStack(alignment: .leading, spacing: 10) {
                ShimmerBlock(width: 160, height: 14)
                ShimmerBlock(width: 240, height: 34)
                ShimmerBlock(width: 200, height: 14)
            }
            .padding(.top, 18)
            HStack(spacing: 8) {
                ForEach(0..<4, id: \.self) { _ in ShimmerBlock(width: 84, height: 38, corner: 19) }
            }
            ForEach(0..<4, id: \.self) { _ in
                HStack(spacing: 12) {
                    ShimmerBlock(width: 92, height: 92, corner: 14)
                    VStack(alignment: .leading, spacing: 8) {
                        ShimmerBlock(width: 150, height: 16)
                        ShimmerBlock(width: 200, height: 12)
                        ShimmerBlock(width: 90, height: 14)
                    }
                    Spacer()
                }
                .padding(12)
                .card()
            }
        }
        .padding(.horizontal, 16)
        .redacted(reason: .placeholder)
    }
}
