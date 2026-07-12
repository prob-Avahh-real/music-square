import SwiftUI
import AVFoundation

// MARK: - Piano Roll Composer

struct ComposerView: View {
    @EnvironmentObject var compositionsVM: CompositionsViewModel
    @EnvironmentObject var authVM: AuthViewModel

    @State private var title = ""
    @State private var description = ""
    @State private var bpm: Double = 120
    @State private var selectedInstrument = "piano"
    @State private var coverColor = "#6C5CE7"
    @State private var isPublic = true
    @State private var showPublishSheet = false

    // EDIT MODE: track editing via piano roll
    @State private var isEditing = false
    @State private var tracks: [TrackData] = []
    @State private var currentTrackIndex = 0

    // Playback
    @State private var isPlaying = false
    @State private var audioEngine: AVAudioEngine?
    private let synth = AudioSynth()

    let instruments = ["piano", "guitar", "bass", "drums", "synth", "pad", "strings", "flute"]
    let instrumentIcons: [String: String] = [
        "piano": "pianokeys", "guitar": "guitars", "bass": "guitars.fill",
        "drums": "drum.fill", "synth": "waveform", "pad": "circle.grid.cross",
        "strings": "violin.fill", "flute": "flute"
    ]

    let colorOptions = ["#6C5CE7", "#F9CA24", "#00B894", "#FD79A8", "#0984E3", "#E17055", "#A29BFE", "#55EFC4"]

    // 2 octave piano roll (C3 to C5 = MIDI 48-72)
    let noteRange = 48...72
    let beatsPerRow = 16
    let subdivisionsPerBeat = 2
    var totalColumns: Int { beatsPerRow * subdivisionsPerBeat }

    var body: some View {
        NavigationStack {
            if isEditing {
                pianoRollEditor
            } else {
                composerHome
            }
        }
    }

    // MARK: - Home Screen

    var composerHome: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "music.quarternote.3")
                            .font(.system(size: 48))
                            .foregroundColor(.purple)
                        Text("创建新作品")
                            .font(.title2.bold())
                    }
                    .padding(.top, 20)

                    // Quick start: instrument picker -> piano roll
                    VStack(alignment: .leading, spacing: 12) {
                        Text("选择乐器开始创作")
                            .font(.headline)
                            .padding(.horizontal)

                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                            ForEach(instruments, id: \.self) { inst in
                                Button {
                                    selectedInstrument = inst
                                    startNewTrack()
                                } label: {
                                    VStack(spacing: 6) {
                                        Image(systemName: instrumentIcons[inst] ?? "music.note")
                                            .font(.title2)
                                        Text(inst.capitalized)
                                            .font(.caption)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(selectedInstrument == inst ? Color.purple.opacity(0.15) : Color(.systemBackground))
                                    .foregroundColor(selectedInstrument == inst ? .purple : .primary)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(selectedInstrument == inst ? Color.purple : Color.clear, lineWidth: 1.5)
                                    )
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Existing tracks
                    if !tracks.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("已添加的音轨")
                                    .font(.headline)
                                Spacer()
                                Text("\(tracks.count) 轨")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.horizontal)

                            ForEach(Array(tracks.enumerated()), id: \.element.id) { idx, track in
                                HStack {
                                    Image(systemName: instrumentIcons[track.instrument] ?? "music.note")
                                        .frame(width: 30)
                                    Text(track.instrument.capitalized)
                                    Spacer()
                                    Text("\(track.notes.count) 音符")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Button("编辑") {
                                        currentTrackIndex = idx
                                        isEditing = true
                                    }
                                    .font(.caption)
                                    .foregroundColor(.purple)
                                    Button {
                                        tracks.remove(at: idx)
                                    } label: {
                                        Image(systemName: "trash")
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 8)
                                .background(Color(.systemBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .padding(.horizontal)
                            }
                        }
                    }

                    // BPM & Color
                    VStack(alignment: .leading, spacing: 12) {
                        Text("设置")
                            .font(.headline)
                            .padding(.horizontal)

                        VStack(spacing: 14) {
                            HStack {
                                Text("BPM: \(Int(bpm))")
                                    .font(.subheadline)
                                Slider(value: $bpm, in: 40...240, step: 1)
                                    .tint(.purple)
                            }

                            HStack {
                                Text("封面颜色")
                                    .font(.subheadline)
                                Spacer()
                                ForEach(colorOptions, id: \.self) { colorHex in
                                    Circle()
                                        .fill(Color(hex: colorHex))
                                        .frame(width: 28, height: 28)
                                        .overlay(
                                            Circle()
                                                .stroke(coverColor == colorHex ? Color.primary : Color.clear, lineWidth: 2)
                                        )
                                        .onTapGesture { coverColor = colorHex }
                                }
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal)
                    }

                    // Publish
                    Button {
                        showPublishSheet = true
                    } label: {
                        Label("发布作品", systemImage: "paperplane.fill")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(tracks.isEmpty ? Color.gray : Color.purple)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(tracks.isEmpty)
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
        }
        .navigationTitle("作曲")
        .sheet(isPresented: $showPublishSheet) {
            publishSheet
        }
    }

    // MARK: - Publish Sheet

    var publishSheet: some View {
        NavigationStack {
            Form {
                Section("作品信息") {
                    TextField("标题", text: $title)
                    TextField("描述", text: $description, axis: .vertical)
                        .lineLimit(3)
                }

                Section {
                    HStack {
                        Text("BPM")
                        Spacer()
                        Text("\(Int(bpm))")
                            .foregroundColor(.secondary)
                    }
                    Toggle("公开", isOn: $isPublic)
                }

                Section {
                    Button {
                        Task {
                            let duration = tracks.flatMap { $0.notes }.map { $0.start + $0.duration }.max() ?? 4.0
                            let comp = await compositionsVM.createComposition(
                                title: title.isEmpty ? "未命名作品" : title,
                                description: description,
                                bpm: Int(bpm),
                                tracks: tracks,
                                duration: duration,
                                coverColor: coverColor,
                                isPublic: isPublic
                            )
                            if comp != nil {
                                tracks = []
                                title = ""
                                description = ""
                                showPublishSheet = false
                            }
                        }
                    } label: {
                        HStack {
                            Spacer()
                            if compositionsVM.isLoading {
                                ProgressView()
                            } else {
                                Text("发布到广场")
                                    .fontWeight(.semibold)
                            }
                            Spacer()
                        }
                    }
                    .disabled(title.isEmpty || tracks.isEmpty)
                }
            }
            .navigationTitle("发布作品")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { showPublishSheet = false }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Piano Roll Editor

    var pianoRollEditor: some View {
        VStack(spacing: 0) {
            // Toolbar
            HStack {
                Button("完成") {
                    isEditing = false
                }
                .fontWeight(.semibold)

                Spacer()

                Text(tracks.isEmpty ? selectedInstrument.capitalized : tracks[currentTrackIndex].instrument.capitalized)
                    .font(.headline)

                Spacer()

                HStack(spacing: 16) {
                    Button {
                        playTrack()
                    } label: {
                        Image(systemName: isPlaying ? "stop.fill" : "play.fill")
                            .font(.title3)
                    }

                    Button("清除") {
                        if !tracks.isEmpty {
                            tracks[currentTrackIndex].notes.removeAll()
                        }
                    }
                    .font(.caption)
                    .foregroundColor(.red)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 10)
            .background(.bar)

            // Grid
            ScrollView([.horizontal, .vertical]) {
                VStack(spacing: 0) {
                    // Beat numbers header
                    HStack(spacing: 0) {
                        // Margin for note labels
                        Rectangle().fill(.clear).frame(width: 36, height: 24)
                        ForEach(0..<totalColumns, id: \.self) { col in
                            Rectangle()
                                .fill(col % subdivisionsPerBeat == 0 ? Color.secondary.opacity(0.3) : Color.secondary.opacity(0.1))
                                .frame(width: 28, height: 24)
                                .overlay(
                                    Group {
                                        if col % subdivisionsPerBeat == 0 {
                                            Text("\(col / subdivisionsPerBeat + 1)")
                                                .font(.system(size: 8))
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                )
                        }
                    }

                    // Piano roll grid
                    ForEach(Array(noteRange.reversed()), id: \.self) { pitch in
                        HStack(spacing: 0) {
                            // Note label (highlight white keys)
                            let isBlack = [1,3,6,8,10].contains(pitch % 12)
                            Text(noteLabel(pitch))
                                .font(.system(size: 9))
                                .frame(width: 36, height: 32)
                                .background(isBlack ? Color(.systemGray5) : Color(.systemBackground))
                                .border(Color(.separator), width: 0.3)

                            // Grid cells
                            ForEach(0..<totalColumns, id: \.self) { col in
                                let isActive = isNoteActive(pitch: pitch, col: col)
                                Rectangle()
                                    .fill(isActive ? instrumentColor : Color.clear)
                                    .frame(width: 28, height: 32)
                                    .border(Color(.separator).opacity(0.3), width: 0.3)
                                    .onTapGesture {
                                        toggleNote(pitch: pitch, col: col)
                                    }
                            }
                        }
                    }
                }
            }

            // Bottom instrument selector
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(instruments, id: \.self) { inst in
                        Button {
                            changeInstrument(inst)
                        } label: {
                            VStack(spacing: 4) {
                                Image(systemName: instrumentIcons[inst] ?? "music.note")
                                    .font(.title3)
                                Text(inst.capitalized)
                                    .font(.system(size: 9))
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(currentInstrument == inst ? Color.purple.opacity(0.2) : Color.clear)
                            .foregroundColor(currentInstrument == inst ? .purple : .secondary)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 6)
            }
            .background(.bar)
        }
    }

    // MARK: - Helper functions

    var currentInstrument: String {
        tracks.isEmpty ? selectedInstrument : tracks[currentTrackIndex].instrument
    }

    var instrumentColor: Color {
        switch currentInstrument {
        case "piano": return .blue
        case "guitar": return .green
        case "bass": return .orange
        case "drums": return .red
        case "synth": return .purple
        case "pad": return .teal
        case "strings": return .indigo
        case "flute": return .cyan
        default: return .purple
        }
    }

    func noteLabel(_ pitch: Int) -> String {
        let names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        let octave = pitch / 12 - 1
        return "\(names[pitch % 12])\(octave)"
    }

    func noteTime(col: Int) -> Double {
        // Each col = 1/subdivision of a beat. At subdivisionsPerBeat=2, each col = 1/8 note.
        (Double(col) / Double(subdivisionsPerBeat)) * (60.0 / bpm)
    }

    func isNoteActive(pitch: Int, col: Int) -> Bool {
        guard !tracks.isEmpty else { return false }
        let time = noteTime(col: col)
        let nextTime = noteTime(col: col + 1)
        return tracks[currentTrackIndex].notes.contains { n in
            n.pitch == pitch && n.start <= time && (n.start + n.duration) > time
        }
    }

    func toggleNote(pitch: Int, col: Int) {
        guard !tracks.isEmpty else { return }
        let time = noteTime(col: col)
        let noteDur = noteTime(col: 1) // one grid cell duration

        if let idx = tracks[currentTrackIndex].notes.firstIndex(where: { $0.pitch == pitch && abs($0.start - time) < 0.001 }) {
            tracks[currentTrackIndex].notes.remove(at: idx)
        } else {
            let note = NoteData(pitch: pitch, start: time, duration: noteDur)
            tracks[currentTrackIndex].notes.append(note)
        }
    }

    func startNewTrack() {
        let track = TrackData(instrument: selectedInstrument, notes: [])
        tracks.append(track)
        currentTrackIndex = tracks.count - 1
        isEditing = true
    }

    func changeInstrument(_ inst: String) {
        if !tracks.isEmpty {
            tracks[currentTrackIndex] = TrackData(instrument: inst, notes: tracks[currentTrackIndex].notes)
        }
        selectedInstrument = inst
    }

    // MARK: - Audio Playback (basic sine wave synth via AVAudioEngine)

    func playTrack() {
        if isPlaying {
            synth.stop()
            isPlaying = false
            return
        }

        guard !tracks.isEmpty else { return }
        let notes = tracks[currentTrackIndex].notes
        guard !notes.isEmpty else { return }

        isPlaying = true
        synth.play(notes: notes, bpm: bpm) {
            isPlaying = false
        }
    }
}

// MARK: - Simple Audio Synth

class AudioSynth {
    private var engine: AVAudioEngine?
    private var sourceNode: AVAudioSourceNode?
    private var timer: Timer?
    private var scheduledNotes: [(Double, Double, Double)] = [] // (startTime, freq, duration)
    private var currentSampleTime: Double = 0
    private let sampleRate: Double = 44100
    private var phase: Double = 0

    func play(notes: [NoteData], bpm: Double, onComplete: @escaping () -> Void) {
        stop()

        engine = AVAudioEngine()
        guard let engine = engine else { return }

        let mainMixer = engine.mainMixerNode
        let outputFormat = mainMixer.outputFormat(forBus: 0)
        let sampleRate = outputFormat.sampleRate

        // Convert notes to (time, frequency, duration)
        var events: [(Double, Double, Double)] = []
        for note in notes {
            let freq = 440.0 * pow(2.0, Double(note.pitch - 69) / 12.0)
            events.append((note.start, freq, note.duration))
        }
        events.sort { $0.0 < $1.0 }

        guard !events.isEmpty else { onComplete(); return }

        var currentIndex = 0
        var currentNoteStart: Double = 0
        var currentFreq: Double = 440
        var currentDuration: Double = 0
        var envelopePhase: Double = 0

        sourceNode = AVAudioSourceNode { _, _, frameCount, audioBufferList -> OSStatus in
            let abl = UnsafeMutableAudioBufferListPointer(audioBufferList)
            let buffer = abl[0]
            let buf = buffer.mData!.assumingMemoryBound(to: Float.self)

            for frame in 0..<Int(frameCount) {
                let time = self.currentSampleTime / sampleRate

                // Check if we need to advance to next note
                while currentIndex < events.count && events[currentIndex].0 <= time {
                    let evt = events[currentIndex]
                    currentNoteStart = evt.0
                    currentFreq = evt.1
                    currentDuration = evt.2
                    envelopePhase = 0
                    currentIndex += 1
                }

                var sample: Float = 0

                if currentIndex > 0 {
                    let noteTime = time - currentNoteStart
                    if noteTime < currentDuration {
                        // ADSR envelope
                        let attack: Double = 0.01
                        let decay: Double = 0.05
                        let sustain: Double = 0.7
                        let release: Double = 0.1
                        var env: Double
                        if noteTime < attack {
                            env = noteTime / attack
                        } else if noteTime < attack + decay {
                            let t = (noteTime - attack) / decay
                            env = 1.0 - (1.0 - sustain) * t
                        } else if noteTime < currentDuration - release {
                            env = sustain
                        } else {
                            let t = (noteTime - (currentDuration - release)) / release
                            env = sustain * max(0, 1.0 - t)
                        }
                        // Sine wave
                        sample = Float(sin(2.0 * .pi * self.phase) * env * 0.3)
                        self.phase += currentFreq / sampleRate
                        if self.phase > 1.0 { self.phase -= floor(self.phase) }
                    }
                }

                buf[frame] = sample
                self.currentSampleTime += 1
            }

            // Check if all notes done
            if currentIndex >= events.count {
                let lastNoteEnd = events.last.map { $0.0 + $0.2 } ?? 0
                if self.currentSampleTime / sampleRate > lastNoteEnd + 0.5 {
                    DispatchQueue.main.async { onComplete() }
                }
            }

            return noErr
        }

        engine.attach(sourceNode!)
        engine.connect(sourceNode!, to: mainMixer, format: outputFormat)
        engine.prepare()

        do {
            try engine.start()
        } catch {
            print("Audio engine error: \(error)")
            onComplete()
        }

        // Safety timer: stop after max duration
        let maxTime = (events.last?.0 ?? 0) + (events.last?.2 ?? 0) + 1.0
        timer = Timer.scheduledTimer(withTimeInterval: maxTime, repeats: false) { _ in
            self.stop()
            onComplete()
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
        engine?.stop()
        sourceNode = nil
        engine = nil
        currentSampleTime = 0
        phase = 0
    }
}

#Preview {
    ComposerView()
        .environmentObject(CompositionsViewModel())
        .environmentObject(AuthViewModel())
}
