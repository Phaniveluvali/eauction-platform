{{/*
Expand the name of the chart.
*/}}
{{- define "eauction-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "eauction-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "eauction-platform.labels" -}}
helm.sh/chart: {{ include "eauction-platform.chart" . }}
{{ include "eauction-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "eauction-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "eauction-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "eauction-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Pod Anti-Affinity Strategy (Soft for Single-Node, Hard for Multi-Node)
*/}}
{{- define "eauction-platform.podAntiAffinity" -}}
{{- $app := .app -}}
{{- $soft := .soft -}}
affinity:
  podAntiAffinity:
    {{- if $soft }}
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - {{ $app }}
          topologyKey: "kubernetes.io/hostname"
    {{- else }}
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values:
                - {{ $app }}
        topologyKey: "topology.kubernetes.io/zone"
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values:
                - {{ $app }}
        topologyKey: "kubernetes.io/hostname"
    {{- end }}
{{- end }}
