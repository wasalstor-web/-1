#!/bin/bash
###############################################################################
# 🤖 Mubsat AI Smart Deployment Script
# Intelligent Assistant Auto-Deploy System
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Server Configuration
SERVER_IP="46.202.159.100"
SERVER_USER="root"
APP_DIR="/var/www/mubsat-ai"
DB_NAME="mubsat_ai"
DB_USER="mubsat_user"

# Timing
START_TIME=$(date +%s)

# Report Arrays
declare -a STEPS_STATUS
declare -a STEPS_DURATION
declare -a WARNINGS
declare -a ERRORS

log_step() {
    local step_num=$1
    local total=$2
    local message=$3
    echo -e "\n${BLUE}[${step_num}/${total}]${NC} ${message}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS+=("$1")
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS+=("$1")
}

log_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

run_remote_command() {
    local description=$1
    local command=$2
    local step_start=$(date +%s)
    
    echo -e "${PURPLE}→${NC} ${description}..."
    
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "${command}" 2>/tmp/ssh_error.log; then
        local step_end=$(date +%s)
        local duration=$((step_end - step_start))
        STEPS_STATUS+=("✓ ${description}")
        STEPS_DURATION+=("${duration}s")
        log_success "Done (${duration}s)"
        return 0
    else
        local error_msg=$(cat /tmp/ssh_error.log 2>/dev/null || echo "Unknown error")
        STEPS_STATUS+=("✗ ${description}")
        ERRORS+=("${description}: ${error_msg}")
        log_error "Failed: ${error_msg}"
        return 1
    fi
}

print_banner() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║      🤖 Mubsat AI - Intelligent Auto-Deploy System        ║"
    echo "║           منصة مبسط AI - النشر الذكي التلقائي            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_report() {
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    echo -e "\n${PURPLE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                  📊 Deployment Report                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "⏱️  Total Duration: ${total_duration}s"
    echo -e "📍 Server: ${SERVER_IP}"
    echo -e "📁 Directory: ${APP_DIR}\n"
    
    if [ ${#STEPS_STATUS[@]} -gt 0 ]; then
        echo -e "${BLUE}📋 Steps Completed:${NC}"
        for i in "${!STEPS_STATUS[@]}"; do
            echo "   $((i+1)). ${STEPS_STATUS[$i]} ${STEPS_DURATION[$i]}"
        done
        echo ""
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Warnings:${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo "   - $warning"
        done
        echo ""
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "${RED}❌ Errors:${NC}"
        for error in "${ERRORS[@]}"; do
            echo "   - $error"
        done
        echo ""
    fi
    
    if [ ${#ERRORS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo -e "${CYAN}🌐 Application URL: http://${SERVER_IP}${NC}"
    else
        echo -e "${RED}❌ Deployment failed with ${#ERRORS[@]} error(s)${NC}"
    fi
    
    echo -e "\n${'═'%.0s}$(seq 1 60)}\n"
}

check_ssh_connection() {
    log_step 1 10 "Testing SSH connection to ${SERVER_IP}"
    
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'SSH OK'" >/dev/null 2>&1; then
        log_success "SSH connection successful"
        return 0
    else
        log_error "Cannot connect to server via SSH"
        log_info "Please ensure:"
        log_info "  1. SSH key is configured"
        log_info "  2. Server is accessible"
        log_info "  3. Root access is available"
        return 1
    fi
}

generate_passwords() {
    log_step 2 10 "Generating secure credentials"
    
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    SESSION_SECRET=$(openssl rand -base64 32)
    
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🔐 Generated Credentials (SAVE THESE!)${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "Database Password: ${GREEN}${DB_PASS}${NC}"
    echo -e "Session Secret: ${GREEN}${SESSION_SECRET}${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
    
    sleep 3
}

setup_infrastructure() {
    log_step 3 10 "Setting up server infrastructure"
    
    run_remote_command "Install PM2" \
        "export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm install -g pm2 2>/dev/null || true"
    
    run_remote_command "Start PostgreSQL" \
        "sudo systemctl start postgresql && sudo systemctl enable postgresql"
    
    run_remote_command "Create database" \
        "sudo -u postgres psql -c \"CREATE DATABASE ${DB_NAME};\" 2>/dev/null || true"
    
    run_remote_command "Create database user" \
        "sudo -u postgres psql -c \"CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';\" 2>/dev/null || true"
    
    run_remote_command "Grant database privileges" \
        "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};\""
}

create_directories() {
    log_step 4 10 "Creating application directories"
    
    run_remote_command "Create app directory" \
        "mkdir -p ${APP_DIR} && mkdir -p ${APP_DIR}/logs"
}

create_config_files() {
    log_step 5 10 "Creating configuration files"
    
    run_remote_command "Create .env file" \
        "cat > ${APP_DIR}/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
SESSION_SECRET=${SESSION_SECRET}
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF"
    
    run_remote_command "Create PM2 ecosystem config" \
        "cat > ${APP_DIR}/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mubsat-ai',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 5000 },
    error_file: './logs/error.log',
    out_file: './logs/output.log'
  }]
};
EOF"
}

configure_nginx() {
    log_step 6 10 "Configuring Nginx"
    
    run_remote_command "Create Nginx config" \
        "sudo tee /etc/nginx/conf.d/mubsat-ai.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name ${SERVER_IP} _;
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF"
    
    run_remote_command "Remove default Nginx configs" \
        "sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf 2>/dev/null || true"
    
    run_remote_command "Reload Nginx" \
        "sudo nginx -t && sudo systemctl reload nginx"
}

upload_files() {
    log_step 7 10 "Uploading application files"
    
    log_info "Creating deployment package..."
    
    if tar czf /tmp/mubsat-deploy.tar.gz \
        -C /home/runner/workspace \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=.env \
        . 2>/dev/null; then
        
        log_success "Package created"
        
        log_info "Uploading to server..."
        if scp -o StrictHostKeyChecking=no /tmp/mubsat-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/ 2>/tmp/scp_error.log; then
            log_success "Files uploaded"
            
            run_remote_command "Extract files" \
                "cd ${APP_DIR} && tar xzf /tmp/mubsat-deploy.tar.gz && rm /tmp/mubsat-deploy.tar.gz"
            
            rm /tmp/mubsat-deploy.tar.gz
        else
            log_error "File upload failed: $(cat /tmp/scp_error.log)"
            return 1
        fi
    else
        log_error "Failed to create deployment package"
        return 1
    fi
}

build_application() {
    log_step 8 10 "Building application"
    
    run_remote_command "Install dependencies" \
        "cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm install"
    
    run_remote_command "Build application" \
        "cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm run build"
    
    run_remote_command "Run database migrations" \
        "cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm run db:push --force"
}

deploy_application() {
    log_step 9 10 "Deploying application"
    
    run_remote_command "Stop existing PM2 processes" \
        "export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && pm2 delete mubsat-ai 2>/dev/null || true"
    
    run_remote_command "Start application with PM2" \
        "cd ${APP_DIR} && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && pm2 start ecosystem.config.js && pm2 save"
    
    run_remote_command "Configure PM2 startup" \
        "export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && pm2 startup systemd -u root --hp /root 2>/dev/null || true"
}

verify_deployment() {
    log_step 10 10 "Verifying deployment"
    
    sleep 3
    
    if run_remote_command "Check PM2 status" \
        "export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && pm2 list | grep mubsat-ai"; then
        
        if run_remote_command "Test application endpoint" \
            "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000 | grep -q '200\\|301\\|302'"; then
            log_success "Application is responding"
        else
            log_warning "Application may not be responding correctly"
        fi
    else
        log_error "Application not found in PM2"
    fi
}

main() {
    print_banner
    
    # Pre-flight checks
    if ! command -v ssh &> /dev/null; then
        log_error "SSH client not found"
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        log_error "SCP not found"
        exit 1
    fi
    
    # Execute deployment
    check_ssh_connection || exit 1
    generate_passwords
    setup_infrastructure
    create_directories
    create_config_files
    configure_nginx
    upload_files || { print_report; exit 1; }
    build_application
    deploy_application
    verify_deployment
    
    # Print final report
    print_report
    
    if [ ${#ERRORS[@]} -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run deployment
main
