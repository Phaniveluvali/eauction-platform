import yaml
import subprocess

with open('/tmp/eauction-config.yaml', 'r') as f:
    cfg = yaml.safe_load(f)

cfg['data']['SPRING_MAIL_USERNAME'] = 'phani_veluvali@tecnics.com'
cfg['data']['SPRING_MAIL_FROM'] = 'phani_veluvali@tecnics.com'

with open('/tmp/eauction-config.yaml', 'w') as f:
    yaml.dump(cfg, f)

res = subprocess.run(['sudo', 'kubectl', 'apply', '-f', '/tmp/eauction-config.yaml'], capture_output=True, text=True)
print('STDOUT:', res.stdout)
print('STDERR:', res.stderr)
