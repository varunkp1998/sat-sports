def average(values):
    return sum(values) / len(values) if values else 0

def generate_feedback(analysis):
    lines = []
    current_phase = analysis.get("current_phase", "Unknown")
    phase_data = analysis.get("phases", {})

    lines.append(f"🎯 Current Phase: {current_phase}")
    lines.append("🌀 Detected Phases: " + ", ".join(phase_data.keys()))

    for phase, data in phase_data.items():
        lines.append(f"\n📌 {phase} Phase Feedback:")
        lines.append(f"   🦵 Knee Angle: {data.get('knee_angle', 0)}°")
        lines.append(f"   💪 Arm Angle: {data.get('arm_angle', 0)}°")
        lines.append(f"   🧍 Hip Angle: {data.get('hip_angle', 0)}°")
        lines.append(f"   ⏱ Duration: {data.get('duration', 0)}s")
        lines.append(f"   🟢 Jump Detected: {'Yes' if data.get('jump') else 'No'}")

        # Add phase-wise suggestions
        suggestions = []
        if data.get("knee_angle", 0) < 140:
            suggestions.append("Bend your knees more.")
        if data.get("hip_angle", 0) < 130:
            suggestions.append("Open up the hip during preparation.")
        if not data.get("jump"):
            suggestions.append("Try to time your jump for better impact.")

        if suggestions:
            lines.append("   💡 Suggestions: " + " ".join(suggestions))

    lines.append(f"\n🏅 Overall Score: {analysis.get('score', 0)} / 10")
    return "\n".join(lines)
