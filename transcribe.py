import sys
import os
import whisper

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
        
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(f"Error: File not found {audio_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        model = whisper.load_model("tiny")
        result = model.transcribe(audio_path)
        # Clean output
        text = result.get("text", "").strip()
        print(text)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
