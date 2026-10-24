; Custom pages / actions for the Yapper Windows installer (electron-builder NSIS include)

!ifndef BUILD_UNINSTALLER
  !include nsDialogs.nsh
  !include LogicLib.nsh

  Var YapperStartupCheckbox
  Var YapperUpdateCheckbox
  Var YapperStartupState
  Var YapperUpdateState

  Function YapperOptionsPageCreate
    !insertmacro MUI_HEADER_TEXT "Startup and updates" "Choose how Yapper behaves on this computer."
    nsDialogs::Create 1018
    Pop $0
    ${If} $0 == error
      Abort
    ${EndIf}

    ${NSD_CreateCheckbox} 0 10u 100% 12u "Open Yapper when Windows starts"
    Pop $YapperStartupCheckbox
    ${NSD_Check} $YapperStartupCheckbox

    ${NSD_CreateCheckbox} 0 34u 100% 12u "Check for updates automatically"
    Pop $YapperUpdateCheckbox
    ${NSD_Check} $YapperUpdateCheckbox

    ${NSD_CreateLabel} 0 62u 100% 24u "Both options are optional. To change them later, run this installer again."
    Pop $0

    nsDialogs::Show
  FunctionEnd

  Function YapperOptionsPageLeave
    ${NSD_GetState} $YapperStartupCheckbox $YapperStartupState
    ${NSD_GetState} $YapperUpdateCheckbox $YapperUpdateState
  FunctionEnd

  !macro customPageAfterChangeDir
    Page custom YapperOptionsPageCreate YapperOptionsPageLeave
  !macroend

  !macro customInstall
    SetShellVarContext current

    ; Open at startup (per-user)
    ${If} $YapperStartupState == "0"
      DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Yapper"
    ${Else}
      WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Yapper" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
    ${EndIf}

    ; Update-check preference, read by the app at launch
    CreateDirectory "$APPDATA\Yapper"
    FileOpen $0 "$APPDATA\Yapper\settings.json" w
    ${If} $YapperUpdateState == "0"
      FileWrite $0 '{"checkUpdates":false}'
    ${Else}
      FileWrite $0 '{"checkUpdates":true}'
    ${EndIf}
    FileClose $0
  !macroend
!endif

!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Yapper"
!macroend
