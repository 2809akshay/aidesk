document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Show active content
                    tabContents.forEach(content => content.classList.remove('active'));
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
            
            // Speech to Text functionality
            const startBtn = document.getElementById('startRecording');
            const stopBtn = document.getElementById('stopRecording');
            const saveBtn = document.getElementById('saveTranscript');
            const clearBtn = document.getElementById('clearText');
            const readBtn = document.getElementById('readTranscript');
            const transcriptText = document.getElementById('transcriptText');
            const transcriptTitle = document.getElementById('transcriptTitle');
            const sttStatus = document.getElementById('sttStatus');
            const sttLanguage = document.getElementById('sttLanguage');
            
            // Text to Speech functionality
            const ttsStartBtn = document.getElementById('startTts');
            const ttsStopBtn = document.getElementById('stopTts');
            const downloadBtn = document.getElementById('downloadAudio');
            const ttsText = document.getElementById('ttsText');
            const ttsLanguage = document.getElementById('ttsLanguage');
            const ttsVoice = document.getElementById('ttsVoice');
            const ttsVolume = document.getElementById('ttsVolume');
            const ttsRate = document.getElementById('ttsRate');
            const ttsPitch = document.getElementById('ttsPitch');
            const volumeValue = document.getElementById('volumeValue');
            const rateValue = document.getElementById('rateValue');
            const pitchValue = document.getElementById('pitchValue');
            const ttsStatus = document.getElementById('ttsStatus');
            
            let speechSynthesis = window.speechSynthesis;
            let recognition;
            let isRecording = false;
            let isSpeaking = false;
            
            // Initialize Speech Recognition if available
            function initSpeechRecognition() {
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    sttStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Speech recognition is not supported in this browser.';
                    sttStatus.style.background = '#fef2f2';
                    sttStatus.style.color = '#ef4444';
                    startBtn.disabled = true;
                    return;
                }
                
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = sttLanguage.value;
                
                recognition.onresult = function(event) {
                    let interimTranscript = '';
                    let finalTranscript = '';
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }
                    
                    transcriptText.value = finalTranscript + interimTranscript;
                };
                
                recognition.onerror = function(event) {
                    console.error('Speech recognition error', event.error);
                    stopRecording();
                    
                    if (event.error === 'not-allowed') {
                        sttStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Microphone access is not allowed. Please enable microphone permissions.';
                    } else {
                        sttStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Speech recognition error: ${event.error}`;
                    }
                    
                    sttStatus.style.background = '#fef2f2';
                    sttStatus.style.color = '#ef4444';
                };
                
                recognition.onend = function() {
                    if (isRecording) {
                        // If we're still supposed to be recording, restart
                        recognition.start();
                    }
                };
            }
            
            // Initialize Text-to-Speech voices
            function loadVoices() {
                if (!speechSynthesis) {
                    ttsVoice.innerHTML = '<option value="">Text-to-Speech not supported</option>';
                    ttsStartBtn.disabled = true;
                    return;
                }
                
                // Load voices when they become available
                let voices = speechSynthesis.getVoices();
                if (voices.length === 0) {
                    speechSynthesis.addEventListener('voiceschanged', function() {
                        voices = speechSynthesis.getVoices();
                        populateVoiceList(voices);
                    });
                } else {
                    populateVoiceList(voices);
                }
            }
            
            function populateVoiceList(voices) {
                ttsVoice.innerHTML = '';
                const currentLang = ttsLanguage.value;
                
                // Filter voices by current language
                const langVoices = voices.filter(voice => voice.lang.startsWith(currentLang));
                
                if (langVoices.length === 0) {
                    ttsVoice.innerHTML = '<option value="">No voices available for this language</option>';
                    return;
                }
                
                langVoices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    ttsVoice.appendChild(option);
                });
            }
            
            function startRecording() {
                try {
                    recognition.lang = sttLanguage.value;
                    recognition.start();
                    isRecording = true;
                    startBtn.disabled = true;
                    stopBtn.disabled = false;
                    startBtn.classList.add('pulse');
                    
                    sttStatus.innerHTML = '<i class="fas fa-microphone"></i> Recording in progress...';
                    sttStatus.classList.add('recording');
                } catch (error) {
                    console.error('Recognition start error:', error);
                    sttStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Failed to start recording: ${error.message}`;
                    sttStatus.style.background = '#fef2f2';
                    sttStatus.style.color = '#ef4444';
                }
            }
            
            function stopRecording() {
                isRecording = false;
                recognition.stop();
                startBtn.disabled = false;
                stopBtn.disabled = true;
                startBtn.classList.remove('pulse');
                
                sttStatus.innerHTML = '<i class="fas fa-check-circle"></i> Recording stopped';
                sttStatus.classList.remove('recording');
                sttStatus.style.background = '#f0fdf4';
                sttStatus.style.color = '#166534';
                
                // Reset status after 3 seconds
                setTimeout(() => {
                    sttStatus.innerHTML = '<i class="fas fa-info-circle"></i> Ready to start recording';
                    sttStatus.style.background = '#f1f5f9';
                    sttStatus.style.color = '#1f2937';
                }, 3000);
            }
            
            function saveTranscript() {
                const title = transcriptTitle.value || 'Speech Transcript';
                const text = transcriptText.value;
                
                if (!text.trim()) {
                    sttStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please record some speech before saving.';
                    sttStatus.style.background = '#fef2f2';
                    sttStatus.style.color = '#ef4444';
                    return;
                }
                
                // Show saving indicator
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
                
                // Simulate saving to server
                setTimeout(() => {
                    sttStatus.innerHTML = '<i class="fas fa-check-circle"></i> Transcript saved successfully!';
                    sttStatus.style.background = '#f0fdf4';
                    sttStatus.style.color = '#166534';
                    
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Transcript';
                    saveBtn.disabled = false;
                    
                    // Reset status after 3 seconds
                    setTimeout(() => {
                        sttStatus.innerHTML = '<i class="fas fa-info-circle"></i> Ready to start recording';
                        sttStatus.style.background = '#f1f5f9';
                        sttStatus.style.color = '#1f2937';
                    }, 3000);
                }, 1500);
            }
            
            function clearText() {
                transcriptText.value = '';
                transcriptTitle.value = '';
                
                sttStatus.innerHTML = '<i class="fas fa-check-circle"></i> Text cleared';
                sttStatus.style.background = '#f0fdf4';
                sttStatus.style.color = '#166534';
                
                // Reset status after 2 seconds
                setTimeout(() => {
                    sttStatus.innerHTML = '<i class="fas fa-info-circle"></i> Ready to start recording';
                    sttStatus.style.background = '#f1f5f9';
                    sttStatus.style.color = '#1f2937';
                }, 2000);
            }
            
            function readTranscript() {
                const text = transcriptText.value;
                
                if (!text.trim()) {
                    sttStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No text to read. Please record something first.';
                    sttStatus.style.background = '#fef2f2';
                    sttStatus.style.color = '#ef4444';
                    return;
                }
                
                // Switch to TTS tab
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelector('[data-tab="tts"]').classList.add('active');
                
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById('tts-tab').classList.add('active');
                
                // Set the text to read
                ttsText.value = text;
                
                // Start TTS
                startTts();
            }
            
            function startTts() {
                if (!speechSynthesis) {
                    ttsStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Text-to-Speech is not supported in your browser.';
                    ttsStatus.style.background = '#fef2f2';
                    ttsStatus.style.color = '#ef4444';
                    return;
                }
                
                const text = ttsText.value;
                if (!text.trim()) {
                    ttsStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter some text to convert to speech.';
                    ttsStatus.style.background = '#fef2f2';
                    ttsStatus.style.color = '#ef4444';
                    return;
                }
                
                // Stop any ongoing speech
                speechSynthesis.cancel();
                
                // Create utterance
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.volume = parseFloat(ttsVolume.value);
                utterance.rate = parseFloat(ttsRate.value);
                utterance.pitch = parseFloat(ttsPitch.value);
                
                // Set voice if selected
                const voices = speechSynthesis.getVoices();
                const selectedVoice = ttsVoice.value;
                if (selectedVoice) {
                    const voice = voices.find(v => v.name === selectedVoice);
                    if (voice) utterance.voice = voice;
                }
                
                // Set language
                utterance.lang = ttsLanguage.value;
                
                // Event handlers
                utterance.onstart = function() {
                    isSpeaking = true;
                    ttsStartBtn.disabled = true;
                    ttsStopBtn.disabled = false;
                    ttsStatus.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
                    ttsStatus.classList.add('speaking');
                };
                
                utterance.onend = function() {
                    isSpeaking = false;
                    ttsStartBtn.disabled = false;
                    ttsStopBtn.disabled = true;
                    ttsStatus.innerHTML = '<i class="fas fa-check-circle"></i> Finished speaking';
                    ttsStatus.classList.remove('speaking');
                    ttsStatus.style.background = '#f0fdf4';
                    ttsStatus.style.color = '#166534';
                    
                    setTimeout(() => {
                        ttsStatus.innerHTML = '<i class="fas fa-info-circle"></i> Ready to convert text to speech';
                        ttsStatus.style.background = '#f1f5f9';
                        ttsStatus.style.color = '#1f2937';
                    }, 3000);
                };
                
                utterance.onerror = function(event) {
                    console.error('Speech synthesis error', event);
                    ttsStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error occurred during speech synthesis';
                    ttsStatus.style.background = '#fef2f2';
                    ttsStatus.style.color = '#ef4444';
                };
                
                // Start speaking
                speechSynthesis.speak(utterance);
            }
            
            function stopTts() {
                if (speechSynthesis) {
                    speechSynthesis.cancel();
                    isSpeaking = false;
                    ttsStartBtn.disabled = false;
                    ttsStopBtn.disabled = true;
                    ttsStatus.innerHTML = '<i class="fas fa-stop"></i> Speech stopped';
                    ttsStatus.classList.remove('speaking');
                    
                    setTimeout(() => {
                        ttsStatus.innerHTML = '<i class="fas fa-info-circle"></i> Ready to convert text to speech';
                        ttsStatus.style.background = '#f1f5f9';
                        ttsStatus.style.color = '#1f2937';
                    }, 3000);
                }
            }
            
            function downloadAudio() {
                ttsStatus.innerHTML = '<i class="fas fa-info-circle"></i> Audio download would be implemented with a server-side component';
                ttsStatus.style.background = '#fffbeb';
                ttsStatus.style.color = '#d97706';
            }
            
            // Update value displays for sliders
            ttsVolume.addEventListener('input', () => {
                volumeValue.textContent = ttsVolume.value;
            });
            
            ttsRate.addEventListener('input', () => {
                rateValue.textContent = ttsRate.value;
            });
            
            ttsPitch.addEventListener('input', () => {
                pitchValue.textContent = ttsPitch.value;
            });
            
            // Update voices when language changes
            ttsLanguage.addEventListener('change', () => {
                if (speechSynthesis) {
                    const voices = speechSynthesis.getVoices();
                    populateVoiceList(voices);
                }
            });
            
            // Initialize the application
            initSpeechRecognition();
            loadVoices();
            
            // Event listeners for STT
            startBtn.addEventListener('click', startRecording);
            stopBtn.addEventListener('click', stopRecording);
            saveBtn.addEventListener('click', saveTranscript);
            clearBtn.addEventListener('click', clearText);
            readBtn.addEventListener('click', readTranscript);
            sttLanguage.addEventListener('change', function() {
                if (isRecording) {
                    stopRecording();
                    sttStatus.innerHTML = '<i class="fas fa-info-circle"></i> Language changed. Please start recording again.';
                }
            });
            
            // Event listeners for TTS
            ttsStartBtn.addEventListener('click', startTts);
            ttsStopBtn.addEventListener('click', stopTts);
            downloadBtn.addEventListener('click', downloadAudio);
        });