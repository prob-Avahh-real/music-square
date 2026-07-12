# Music Square

A social music composition app where users can create, share, and discover music compositions.

## Features
- Music composition with note grid editor
- Social feed with composition discovery
- User profiles and follow system
- Comments and likes on compositions
- Authentication system

## Architecture
- MVVM pattern with ObservableObject view models
- REST API client for backend communication
- iOS frontend + Node.js backend

## Requirements
- iOS 16.0+
- Node.js 18+ for backend

## Setup
1. Start the backend: `cd backend && npm install && npm start`
2. Open ios/MusicSquare in Xcode
3. Update `APIClient.swift` baseURL to your server address
