# AgroMarket — сценарио за демонстрација

Ова сценарио ги покрива функционалните и DevOps деловите без непотребно
задржување. Пред презентацијата заменете ги image placeholders и demo тајните.

## 1. Репозиториум и CI

1. Отворете го јавниот GitHub репозиториум во приватен/incognito прозорец.
2. Покажете ги `backend/`, `frontend/`, `docker/`, `k8s/` и `compose.yaml`.
3. Отворете **Actions** и покажете успешни `Laravel checks`, `React checks` и
   двете `Publish ... image` задачи.
4. На Docker Hub покажете ги двата репозиториума и `latest`/commit-SHA tags.

## 2. Функционална демонстрација

1. Најавете се како `admin@agromarket.mk` со лозинка `Admin123!`.
2. Покажете категории од повеќе групи и филтер за механизација или посеви.
3. Сортирајте активни огласи по цена растечки и опаѓачки.
4. Регистрирајте обичен корисник и креирајте `sell` или `buy` оглас.
5. Во **Мој профил** сменете го огласот од `active` во `inactive`, филтрирајте
   ги двете состојби, уредете го, а потоа покажете го modal-от за бришење.
6. Со втор корисник отворете го огласот, покажете контакт/јавен профил и
   оставете оценка од 1 до 5. Потврдете дека новиот просек е јавно видлив.
7. Покажете административно управување со категорија или оглас.

## 3. Docker Compose доказ

```powershell
docker compose ps
docker compose logs backend --tail=50
docker volume ls --filter name=agromarket
```

Објаснете дека `database` е health dependency за `backend`, `backend` за
`frontend`, а податоците остануваат по `docker compose down` благодарение на
`postgres_data`.

## 4. Kubernetes доказ

```powershell
kubectl get namespace agromarket
kubectl get pods,service,ingress,pvc -n agromarket
kubectl describe ingress agromarket -n agromarket
kubectl rollout status deployment/backend -n agromarket
kubectl rollout status deployment/frontend -n agromarket
kubectl rollout status statefulset/postgres -n agromarket
kubectl exec -n agromarket statefulset/postgres -- pg_isready -U agromarket -d agromarket
```

Накратко покажете ги врските:

```text
Ingress /      -> frontend Service -> React/Nginx Pods
Ingress /api   -> backend Service  -> Laravel Pod
Laravel        -> postgres Service -> PostgreSQL StatefulSet -> PVC
```

За видлив доказ на декларативна промена може привремено да се скалира frontend:

```powershell
kubectl scale deployment/frontend -n agromarket --replicas=3
kubectl rollout status deployment/frontend -n agromarket
kubectl get pods -n agromarket -l app.kubernetes.io/component=frontend
kubectl scale deployment/frontend -n agromarket --replicas=2
```

На крај покажете ја апликацијата преку `http://agromarket.local` и DevTools
Network табот, каде `/api` барањата треба да враќаат успешни JSON одговори.
