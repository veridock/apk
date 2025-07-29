; Custom NSIS script for SVG+PHP Launcher

!macro customInstall
  ; Register SVG file association
  DetailPrint "Registering SVG file association..."

  ; Create file association
  WriteRegStr HKCR ".svg" "" "SVGPHPFile"
  WriteRegStr HKCR "SVGPHPFile" "" "SVG+PHP Application"
  WriteRegStr HKCR "SVGPHPFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"

  ; Add "Run with SVG+PHP Launcher" context menu
  WriteRegStr HKCR "SVGPHPFile\shell\open" "" "Run with SVG+PHP Launcher"
  WriteRegStr HKCR "SVGPHPFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Keep default SVG viewer as secondary option
  WriteRegStr HKCR "SVGPHPFile\shell\view" "" "View as Image"
  WriteRegStr HKCR "SVGPHPFile\shell\view\command" "" 'rundll32.exe shimgvw.dll,ImageView_Fullscreen %1'

  ; Add to PATH (optional)
  ${EnvVarUpdate} $0 "PATH" "A" "HKLM" "$INSTDIR"

  ; Create desktop shortcut with custom icon
  CreateShortcut "$DESKTOP\SVG+PHP Launcher.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0

  ; Refresh shell icons
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend

!macro customUnInstall
  ; Remove file association
  DeleteRegKey HKCR ".svg"
  DeleteRegKey HKCR "SVGPHPFile"

  ; Remove from PATH
  ${un.EnvVarUpdate} $0 "PATH" "R" "HKLM" "$INSTDIR"

  ; Remove desktop shortcut
  Delete "$DESKTOP\SVG+PHP Launcher.lnk"

  ; Refresh shell icons
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend

; Custom installer pages
!macro customHeader
  !system "echo Adding custom installer header..."
!macroend

; Welcome page customization
!define MUI_WELCOMEPAGE_TITLE "SVG+PHP Launcher Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will install SVG+PHP Launcher on your computer.$\r$\n$\r$\nSVG+PHP Launcher allows you to run SVG files with embedded PHP code as native desktop applications.$\r$\n$\r$\nClick Next to continue."

; Finish page customization
!define MUI_FINISHPAGE_TITLE "Installation Complete"
!define MUI_FINISHPAGE_TEXT "SVG+PHP Launcher has been installed successfully.$\r$\n$\r$\nYou can now double-click any SVG file to run it as an application."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
!define MUI_FINISHPAGE_RUN_TEXT "Launch SVG+PHP Launcher"