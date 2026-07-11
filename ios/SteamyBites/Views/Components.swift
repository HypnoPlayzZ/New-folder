import SwiftUI

struct ErrorState: View {
    let message: String
    var retry: (() -> Void)?

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 40))
                .foregroundStyle(Theme.ember)
            Text("Something went wrong")
                .font(.headline).foregroundStyle(Theme.text)
            Text(message)
                .font(.footnote).foregroundStyle(Theme.muted)
                .multilineTextAlignment(.center)
            if let retry {
                Button("Try again", action: retry)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.neon)
            }
        }
        .padding(28)
    }
}

struct EmptyState: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 46))
                .foregroundStyle(Theme.accent.opacity(0.85))
                .floating(6)
            Text(title).font(.title3.weight(.bold)).foregroundStyle(Theme.text)
            Text(subtitle)
                .font(.footnote).foregroundStyle(Theme.muted)
                .multilineTextAlignment(.center)
        }
        .padding(28)
    }
}

/// Field used on checkout / sign-in forms.
struct ThemedField: View {
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default

    var body: some View {
        TextField("", text: $text, prompt: Text(placeholder).foregroundColor(Theme.faint))
            .keyboardType(keyboard)
            .foregroundStyle(Theme.text)
            .padding(14)
            .background(Theme.smoke)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Theme.line, lineWidth: 1))
    }
}
