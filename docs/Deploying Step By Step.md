
## Part 4: Upload Files to VM

Now you're copying your app files from your Windows machine to the VM.

### Step 1: Open a NEW Command Prompt

Keep your SSH session open. Open a second Command Prompt window.

### Step 2: Run your build script (if applicable)

```powershell
.\scripts\build-php.ps1
```

This creates the `deploy/` folder with PHP-converted files.

### Step 3: Upload files via SCP

```cmd
scp -P 2211 -r "D:\Work Coding Projects\Submission Forms for FAT\supa_base_start_fresh_form_submission_form_app_20250623\deploy\*" fvuadmin@72.142.23.10:/var/www/fvu/
```

- `scp` = secure copy (like SFTP but command-line)
- `-P 2211` = SSH port
- `-r` = recursive (copies folders too)
- Source = your local deploy folder
- Destination = VM's web directory

Enter your VM password when prompted.

### Step 4: Verify files landed

Go back to your SSH window:

```bash
ls -la /var/www/fvu/
```

You should see your .php files and assets folder.

---

## Part 5: SFTP to Third-Party Server

Now you're pushing files from your VM to the third-party's server.

### Step 1: Connect via SFTP

```bash
sftp -P 2109 username@3.96.182.77
```

- `-P 2109` = third-party's SFTP port
- `username` = credentials from third-party
- `3.96.182.77` = third-party's server IP

Enter the SFTP password when prompted.

### Step 2: Navigate to upload location

```bash
cd /path/to/web/directory
```

(Third-party will tell you where files go)

### Step 3: Upload your files

```bash
put -r /var/www/fvu/*
```

Or upload specific files:

```bash
put /var/www/fvu/upload.php
put /var/www/fvu/analysis.php
put /var/www/fvu/recovery.php
put /var/www/fvu/index.php
put -r /var/www/fvu/assets
```

### Step 4: Exit SFTP

```bash
exit
```

---

## Quick Reference

| Task | Command |
|------|---------|
| SSH into VM | `ssh -p 2211 fvuadmin@72.142.23.10` |
| Check nginx status | `sudo systemctl status nginx` |
| Reload nginx | `sudo systemctl reload nginx` |
| Upload to VM | `scp -P 2211 -r "source/*" fvuadmin@72.142.23.10:/var/www/fvu/` |
| SFTP to third-party | `sftp -P 2109 username@3.96.182.77` |
| List files | `ls -la /var/www/fvu/` |

---

## Troubleshooting

### "Connection refused" when accessing VM IP in browser

The corporate firewall is blocking port 80. Ask IT to open port 80 for external access.

### nginx config test fails

Check for typos in `/etc/nginx/sites-enabled/default`. Common issues:
- Missing semicolons
- Mismatched brackets

### SFTP connection times out

Your IP isn't whitelisted. Ask third-party to whitelist your VM's IP (72.142.23.10) on their SFTP port.

---

## Network Architecture

```
Your Windows PC
      │
      │ SCP (port 2211)
      ▼
Your VM (72.142.23.10)
      │
      │ SFTP (port 2109)
      ▼
Third-Party Server (3.96.182.77)
      │
      │ Users access forms here
      ▼
Forms POST data + PDF + JSON to third-party endpoint
```

SSH

VideoEdit$

VideoUnit!


SFTP

UPLOAD-$$2025simple
