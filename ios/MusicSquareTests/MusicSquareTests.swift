import XCTest
@testable import MusicSquare

final class MusicSquareTests: XCTestCase {
    func testCompositionModel() {
        let comp = Composition(
            id: "test-id",
            user_id: "user-1",
            title: "Test Song",
            description: "A test composition",
            bpm: 120,
            key_signature: "C",
            scale: "major",
            tracks: [],
            duration_secs: 180,
            audio_url: nil,
            cover_color: "#FF0000",
            play_count: 100,
            like_count: 10,
            comment_count: 5,
            is_public: 1,
            created_at: nil,
            username: "testuser",
            avatar_url: nil,
            is_liked: false
        )
        XCTAssertEqual(comp.title, "Test Song")
        XCTAssertEqual(comp.bpm, 120)
        XCTAssertEqual(comp.displayPlays, "100")
    }

    func testUserProfileModel() {
        let profile = UserProfile(
            id: "user-1",
            username: "testuser",
            email: "test@example.com"
        )
        XCTAssertEqual(profile.username, "testuser")
        XCTAssertEqual(profile.email, "test@example.com")
    }

    func testNoteDataModel() {
        let note = NoteData(pitch: 60, start: 0.0, duration: 1.0)
        XCTAssertEqual(note.pitch, 60)
        XCTAssertEqual(note.duration, 1.0)
    }

    func testPaginatedResponse() {
        let pagination = PaginationInfo(page: 1, limit: 20, total: 100, totalPages: 5)
        XCTAssertEqual(pagination.totalPages, 5)
        XCTAssertEqual(pagination.page, 1)
    }
}
