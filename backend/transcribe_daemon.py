import sys
import os
import json
import whisper

def main():
    try:
        # Load model once at startup
        model = whisper.load_model("tiny")
        # Print a ready signal so Node knows it's loaded
        print("READY", flush=True)
    except Exception as e:
        print(f"INIT_ERROR: {str(e)}", flush=True)
        sys.exit(1)

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            audio_path = line.strip()
            if not audio_path:
                continue
            
            if not os.path.exists(audio_path):
                result = {"success": False, "error": f"File not found: {audio_path}"}
            else:
                res = model.transcribe(audio_path)
                text = res.get("text", "").strip()
                result = {"success": True, "text": text}
                
            print(json.dumps(result), flush=True)
        except Exception as e:
            result = {"success": False, "error": str(e)}
            print(json.dumps(result), flush=True)

if __name__ == "__main__":
    main()
