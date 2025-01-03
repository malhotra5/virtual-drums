import numpy as np
import wave
import struct

def create_hihat(duration=0.1, sample_rate=44100):
    # Create white noise
    samples = np.random.uniform(-0.5, 0.5, int(duration * sample_rate))
    
    # Apply quick decay
    decay = np.exp(-np.linspace(0, 10, len(samples)))
    samples = samples * decay
    
    return samples

def create_snare(duration=0.1, sample_rate=44100):
    # Mix sine wave and noise
    t = np.linspace(0, duration, int(duration * sample_rate))
    sine = np.sin(2 * np.pi * 200 * t)
    noise = np.random.uniform(-0.5, 0.5, len(t))
    
    # Apply decay
    decay = np.exp(-np.linspace(0, 8, len(t)))
    samples = (sine * 0.5 + noise * 0.5) * decay
    
    return samples

def create_cymbal(duration=0.2, sample_rate=44100):
    # Create filtered noise with longer decay
    samples = np.random.uniform(-0.5, 0.5, int(duration * sample_rate))
    
    # Apply slower decay for cymbal-like sound
    decay = np.exp(-np.linspace(0, 5, len(samples)))
    samples = samples * decay
    
    return samples

def create_tom(duration=0.15, sample_rate=44100):
    # Create a tom-like sound with lower frequency
    t = np.linspace(0, duration, int(duration * sample_rate))
    sine = np.sin(2 * np.pi * 100 * t)  # Lower frequency for tom
    
    # Apply decay
    decay = np.exp(-np.linspace(0, 6, len(t)))
    samples = sine * decay
    
    return samples

def save_wav(samples, filename, sample_rate=44100):
    with wave.open(filename, 'w') as wav_file:
        # Set parameters
        nchannels = 1
        sampwidth = 2
        
        # Set wav file parameters
        wav_file.setnchannels(nchannels)
        wav_file.setsampwidth(sampwidth)
        wav_file.setframerate(sample_rate)
        
        # Convert float samples to integer samples
        scaled = np.int16(samples * 32767)
        wav_file.writeframes(scaled.tobytes())

# Create and save sounds
hihat = create_hihat()
snare = create_snare()
cymbal = create_cymbal()
tom = create_tom()

save_wav(hihat, 'sounds/hihat.wav')
save_wav(snare, 'sounds/snare.wav')
save_wav(cymbal, 'sounds/cymbal.wav')
save_wav(tom, 'sounds/tom.wav')